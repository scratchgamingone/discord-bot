const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomtvquote')
        .setDescription('Get a random quote from a TV show'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = await axios.get('https://api.breakingbadquotes.xyz/v1/quotes');
            const quoteData = response.data[0];

            if (!quoteData || !quoteData.quote || !quoteData.author) {
                return interaction.editReply('❌ Quote data is missing. Try again.');
            }

            await interaction.editReply(`📺 **"${quoteData.quote}"**\n— ${quoteData.author}`);
        } catch (error) {
            console.error('❌ TV Quote API error:', error.message);
            await interaction.editReply({
                content: '❌ Could not fetch a TV quote. Try again later.',
                ephemeral: true
            });
        }
    }
};
