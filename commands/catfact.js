const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('catfact')
        .setDescription('Get a random cat fact'),

    async execute(interaction) {
        try {
            const response = await axios.get('https://catfact.ninja/fact');
            const fact = response.data.fact;

            await interaction.reply({
                content: `🐱 **Cat Fact:** ${fact}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error fetching cat fact:', error);
            await interaction.reply({
                content: '❌ Failed to fetch a cat fact. Try again later!',
                ephemeral: true
            });
        }
    }
};
