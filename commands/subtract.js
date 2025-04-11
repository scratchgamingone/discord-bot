const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subtract')
        .setDescription('➖ Subtract two numbers (random if not provided)')
        .addNumberOption(option =>
            option.setName('first')
                .setDescription('The number to subtract from (optional)')
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName('second')
                .setDescription('The number to subtract (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const min = -1000;
        const max = 1000;

        let num1 = interaction.options.getNumber('first');
        let num2 = interaction.options.getNumber('second');

        if (num1 === null) num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        if (num2 === null) num2 = Math.floor(Math.random() * (max - min + 1)) + min;

        const result = num1 - num2;

        await interaction.reply(`➖ **${num1} - ${num2} = ${result}**`);
    }
};
