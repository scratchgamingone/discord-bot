const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin — heads or tails?'),

    async execute(interaction) {
        const result = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
        await interaction.reply(result);
    }
};
