const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play Tic Tac Toe vs the bot')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Choose AI difficulty')
                .setRequired(true)
                .addChoices(
                    { name: 'Easy', value: 'easy' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'Hard', value: 'hard' },
                )
        ),

    async execute(interaction) {
        const difficulty = interaction.options.getString('difficulty');
        const player = interaction.user;
        const symbols = { player: '❌', bot: '⭕' };
        let board = Array(9).fill(null);
        let winner = null;
        let playerFirst = true;
        let round = 1;

        const winCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        const checkWinner = (b) => {
            for (const [a, b1, c] of winCombos) {
                if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
            }
            return b.includes(null) ? null : 'draw';
        };

        const getAvailableMoves = (b) =>
            b.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);

        const easyMove = () => {
            const options = getAvailableMoves(board);
            return options[Math.floor(Math.random() * options.length)];
        };

        const mediumMove = () => {
            for (const [a, b, c] of winCombos) {
                const line = [board[a], board[b], board[c]];
                if (line.filter((v) => v === symbols.player).length === 2 && line.includes(null)) {
                    const idx = [a, b, c][line.indexOf(null)];
                    return idx;
                }
            }
            return easyMove();
        };

        const minimax = (b, depth, isMax) => {
            const scoreMap = {
                [symbols.bot]: 10,
                [symbols.player]: -10,
                draw: 0
            };
            const result = checkWinner(b);
            if (result) return scoreMap[result];

            const moves = getAvailableMoves(b);
            if (isMax) {
                let best = -Infinity;
                for (const i of moves) {
                    b[i] = symbols.bot;
                    best = Math.max(best, minimax(b, depth + 1, false));
                    b[i] = null;
                }
                return best;
            } else {
                let best = Infinity;
                for (const i of moves) {
                    b[i] = symbols.player;
                    best = Math.min(best, minimax(b, depth + 1, true));
                    b[i] = null;
                }
                return best;
            }
        };

        const hardMove = () => {
            let bestScore = -Infinity;
            let move;
            for (const i of getAvailableMoves(board)) {
                board[i] = symbols.bot;
                const score = minimax(board, 0, false);
                board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
            return move;
        };

        const botMove = () => {
            if (difficulty === 'easy') return easyMove();
            if (difficulty === 'medium') return mediumMove();
            return hardMove();
        };

        const generateBoard = () => {
            const rows = [];
            for (let row = 0; row < 3; row++) {
                const actionRow = new ActionRowBuilder();
                for (let col = 0; col < 3; col++) {
                    const idx = row * 3 + col;
                    actionRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(idx.toString())
                            .setLabel(board[idx] ?? '➖')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(board[idx] !== null || winner !== null)
                    );
                }
                rows.push(actionRow);
            }
            return rows;
        };

        async function startGame(msg) {
            board = Array(9).fill(null);
            winner = null;

            if (!playerFirst) {
                const botIdx = botMove();
                board[botIdx] = symbols.bot;
            }

            await msg.edit({
                content: `🎮 **Tic Tac Toe** — Round #${round}\nDifficulty: **${difficulty}**\n${symbols.player} = You | ${symbols.bot} = Bot\n${playerFirst ? '🕹️ You go first!' : '🤖 Bot goes first!'}`,
                components: generateBoard()
            });
        }

        const reply = await interaction.reply({
            content: 'Loading game...',
            fetchReply: true
        });

        await startGame(reply);

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 5 * 60_000 // 5 minutes
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== player.id) {
                return i.reply({ content: '❌ Not your game!', ephemeral: true });
            }

            const idx = parseInt(i.customId);
            if (board[idx] !== null || winner !== null) return;

            board[idx] = symbols.player;
            winner = checkWinner(board);

            if (winner === 'draw') {
                await i.update({
                    content: `⚖️ Round #${round} ended in a draw. Starting rematch...`,
                    components: generateBoard()
                });

                // Delay + rematch
                await new Promise((res) => setTimeout(res, 1500));
                round++;
                playerFirst = !playerFirst;
                await startGame(reply);
                return;
            }

            if (winner === symbols.player) {
                collector.stop();
                return i.update({
                    content: `🎉 **You win!** in round #${round}`,
                    components: generateBoard()
                });
            }

            // Bot plays next
            const botIdx = botMove();
            board[botIdx] = symbols.bot;
            winner = checkWinner(board);

            if (winner === 'draw') {
                await i.update({
                    content: `⚖️ Round #${round} ended in a draw. Starting rematch...`,
                    components: generateBoard()
                });

                await new Promise((res) => setTimeout(res, 1500));
                round++;
                playerFirst = !playerFirst;
                await startGame(reply);
                return;
            }

            if (winner === symbols.bot) {
                collector.stop();
                return i.update({
                    content: `💻 The bot wins in round #${round}!`,
                    components: generateBoard()
                });
            }

            await i.update({
                content: `🎮 **Tic Tac Toe** — Round #${round}\nDifficulty: **${difficulty}**\n${symbols.player} = You | ${symbols.bot} = Bot\nYour move!`,
                components: generateBoard()
            });
        });

        collector.on('end', async () => {
            await reply.edit({
                content: '⏹️ Game ended due to inactivity.',
                components: generateBoard()
            }).catch(() => {});
        });
    }
};
