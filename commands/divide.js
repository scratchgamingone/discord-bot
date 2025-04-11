const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('divide')
        .setDescription('➗ Divide two numbers with optional decimal rounding')
        .addNumberOption(option =>
            option.setName('first')
                .setDescription('The numerator')
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName('second')
                .setDescription('The denominator')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('decimals')
                .setDescription('How many decimals to round to (0–5)')
                .setRequired(false)
                .addChoices(
                    { name: '0 decimals', value: 0 },
                    { name: '1 decimal', value: 1 },
                    { name: '2 decimals', value: 2 },
                    { name: '3 decimals', value: 3 },
                    { name: '4 decimals', value: 4 },
                    { name: '5 decimals', value: 5 }
                )
        ),

    async execute(interaction) {
        const min = -20;
        const max = 20;

        let num1 = interaction.options.getNumber('first');
        let num2 = interaction.options.getNumber('second');
        const decimals = interaction.options.getInteger('decimals') ?? 2;

        // Generate random numbers if not provided
        if (num1 === null) num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        if (num2 === null || num2 === 0) {
            do {
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (num2 === 0);
        }

        const result = num1 / num2;

        // Show rounded only if needed
        const display = Number.isInteger(result) ? result : parseFloat(result.toFixed(decimals));

        await interaction.reply(`➗ **${num1} ÷ ${num2} = ${display}**`);
    }
};
