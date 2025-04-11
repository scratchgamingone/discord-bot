const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomnumber')
        .setDescription('🎲 Generate a random number and check if it\'s odd or even')
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('Minimum number (optional)')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('Maximum number (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        let min = interaction.options.getInteger('min');
        let max = interaction.options.getInteger('max');

        // Default range if not provided
        if (min === null && max === null) {
            min = 1;
            max = 100;
        } else if (min === null) {
            min = 1;
        } else if (max === null) {
            max = min + 100;
        }

        // Auto-swap if needed
        if (min > max) [min, max] = [max, min];

        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        const type = randomNumber % 2 === 0 ? 'even' : 'odd';

        await interaction.reply(`🎲 Your random number is: **${randomNumber}**\n🧮 It is **${type}**.`);
    }
};
