const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate_random_password')
        .setDescription('Generate a secure random password')
        .addIntegerOption(option =>
            option.setName('length')
                .setDescription('Length of the password (default: 12)')
                .setMinValue(6)
                .setMaxValue(64)
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('symbols')
                .setDescription('Include symbols like @#$?')
                .setRequired(false)
        ),

    async execute(interaction) {
        const length = interaction.options.getInteger('length') || 12;
        const includeSymbols = interaction.options.getBoolean('symbols') ?? true;

        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let characters = letters + numbers;
        if (includeSymbols) characters += symbols;

        let password = '';
        for (let i = 0; i < length; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        await interaction.reply({
            ephemeral: true,
            content: `🔐 **Your secure password:**\n\`${password}\`\n(Keep it safe!)`
        });
    }
};
