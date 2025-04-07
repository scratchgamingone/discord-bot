const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spacething')
        .setDescription("Get NASA's Astronomy Picture of the Day (APOD)"),

    async execute(interaction) {
        const nasaApiKey = process.env.NASA_API_KEY;

        if (!nasaApiKey) {
            return interaction.reply({
                content: '❌ NASA API key is missing from your `.env` file.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const res = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`);
            const data = res.data;

            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(data.explanation.substring(0, 1024) + (data.explanation.length > 1024 ? '...' : ''))
                .setImage(data.url)
                .setFooter({ text: `📅 ${data.date}` })
                .setColor('DarkBlue');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ NASA API error:', error.message);
            await interaction.editReply({
                content: '❌ Failed to fetch space content. NASA might be busy exploring Mars.',
                ephemeral: true
            });
        }
    }
};
