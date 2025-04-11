const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('➕ Add two numbers (random if not provided)')
        .addNumberOption(option =>
            option.setName('first')
                .setDescription('Enter the first number (optional)')
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName('second')
                .setDescription('Enter the second number (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const min = -1000;
        const max = 1000;

        let num1 = interaction.options.getNumber('first');
        let num2 = interaction.options.getNumber('second');

        if (num1 === null) num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        if (num2 === null) num2 = Math.floor(Math.random() * (max - min + 1)) + min;

        const sum = num1 + num2;

        await interaction.reply(`➕ **${num1} + ${num2} = ${sum}**`);
    }
};
