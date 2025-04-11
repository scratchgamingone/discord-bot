const { SlashCommandBuilder } = require('discord.js');

const START_BALANCE_MIN = 500;
const START_BALANCE_MAX = 2000;

const balances = {};
const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('🎰 Spin the slot machine and bet to win fake money!')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Amount to bet (leave blank to go all-in)')
                .setMinValue(1)
                .setRequired(false)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const userName = interaction.user.username;

        // Assign random balance if user doesn't have one
        if (!balances[userId]) {
            balances[userId] = Math.floor(Math.random() * (START_BALANCE_MAX - START_BALANCE_MIN + 1)) + START_BALANCE_MIN;
        }

        const totalBalance = balances[userId];
        let bet = interaction.options.getInteger('bet');

        // Default to "all in" if no bet entered
        if (bet === null) {
            bet = totalBalance;
        }

        if (bet > totalBalance || bet <= 0) {
            return interaction.reply({
                content: `❌ You can't bet $${bet}. Your current balance is **$${totalBalance}**.`,
                ephemeral: true
            });
        }

        // Spin slots
        const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
        const result = `${slot1} | ${slot2} | ${slot3}`;

        let winnings = 0;
        let message = '';

        if (slot1 === slot2 && slot2 === slot3) {
            winnings = bet * 5;
            message = '🎉 JACKPOT! You won 5x your bet!';
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            winnings = bet * 2;
            message = '✨ You matched two! You won 2x your bet!';
        } else {
            winnings = -bet;
            message = '💀 No match. You lost your bet.';
        }

        // Update balance
        balances[userId] += winnings;

        await interaction.reply(
            `🎰 **SLOTS** 🎰\n${result}\n\n**${userName}**, you bet **$${bet}**.\n${message}\n💰 Your new balance: **$${balances[userId]}**`
        );
    }
};
