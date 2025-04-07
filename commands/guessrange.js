const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

let currentNumber = null;
let currentMax = null;
const userAttempts = new Map();
const lastGuesses = new Map();

function generateNewNumber() {
    currentMax = Math.floor(Math.random() * 91) + 10; // Range: 10–100
    return Math.floor(Math.random() * currentMax) + 1;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess_the_number')
        .setDescription('🎯 Guess the number! The range changes after each win.')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Your guess')
                .setRequired(true)
        ),

    async execute(interaction) {
        const guessChannelId = process.env.GUESS_CHANNEL_ID;
        const winnerRoleId = process.env.WINNER_ROLE_ID;
        const maxAttempts = parseInt(process.env.MAX_ATTEMPTS) || 3;

        const guess = interaction.options.getInteger('number');
        const userId = interaction.user.id;

        if (interaction.channel.id !== guessChannelId) {
            return interaction.reply({
                content: `❌ You can only use this command in <#${guessChannelId}>.`,
                ephemeral: true
            });
        }

        if (currentNumber === null) {
            currentNumber = generateNewNumber();
            console.log(`🎯 First number picked: ${currentNumber} (range: 1–${currentMax})`);
        }

        if (lastGuesses.get(userId) === guess) return;
        lastGuesses.set(userId, guess);

        if (guess < 1 || guess > currentMax) {
            const invalidEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('⚠️ Invalid Guess')
                .setDescription(`Your guess must be between 1 and ${currentMax}.`);
            return interaction.reply({ embeds: [invalidEmbed], ephemeral: true });
        }

        const rangeText = `(The number is between 1 and ${currentMax})`;

        if (guess === currentNumber) {
            const winEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('🎉 Correct Guess!')
                .setDescription(`<@${userId}> guessed the number: **${guess}** ✅\n${rangeText}`);

            const reply = await interaction.reply({ embeds: [winEmbed], fetchReply: true });
            await reply.react('✅');

            const member = interaction.guild.members.cache.get(userId);
            const role = interaction.guild.roles.cache.get(winnerRoleId);
            if (member && role && !member.roles.cache.has(winnerRoleId)) {
                await member.roles.add(role).catch(console.error);
            }

            currentNumber = generateNewNumber();
            console.log(`🔁 New number picked: ${currentNumber} (range: 1–${currentMax})`);

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('🎯 New Round Started')
                        .setDescription(`A new number has been picked! Guess between **1** and **${currentMax}**.`)
                ]
            });

            userAttempts.clear();
            lastGuesses.clear();
        } else {
            const attempts = (userAttempts.get(userId) || 0) + 1;
            userAttempts.set(userId, attempts);

            let embedColor = guess < currentNumber ? 'Yellow' : 'Purple';
            let desc = `<@${userId}> guessed **${guess}** — ❌ Incorrect guess.\n${rangeText}`;

            if (attempts >= maxAttempts) {
                const oddOrEven = currentNumber % 2 === 0 ? 'even' : 'odd';
                desc += `\n💡 Hint: The number is **${oddOrEven}**.`;
            }

            const failEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('❌ Wrong Guess')
                .setDescription(desc);

            await interaction.reply({ embeds: [failEmbed] });
        }
    }
};
