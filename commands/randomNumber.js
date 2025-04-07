const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomnumber')
        .setDescription('Generates a random number between min and max and tells if it is odd or even')
        .addIntegerOption(option => 
            option.setName('min')
                .setDescription('Minimum number')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('max')
                .setDescription('Maximum number')
                .setRequired(true)),
    
    async execute(interaction) {
        const min = interaction.options.getInteger('min');
        const max = interaction.options.getInteger('max');

        if (min >= max) {
            return interaction.reply({ content: '❌ Make sure your **min** is less than **max**.', ephemeral: true });
        }

        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        const type = randomNumber % 2 === 0 ? 'even' : 'odd';

        return interaction.reply(`🎲 Your random number is: **${randomNumber}**. It is **${type}**!`);
    }
};
