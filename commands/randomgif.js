const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomgif')
        .setDescription('Get a random GIF from GIPHY'),

    async execute(interaction) {
        const apiKey = process.env.GIPHY_API_KEY;

        if (!apiKey) {
            return interaction.reply({
                content: '❌ Missing GIPHY API key in `.env`.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        const tags = ['funny', 'meme', 'cat', 'dog', 'anime', 'dance', 'fail', 'reaction'];
        const tag = tags[Math.floor(Math.random() * tags.length)];

        try {
            const res = await axios.get('https://api.giphy.com/v1/gifs/random', {
                params: {
                    api_key: apiKey,
                    tag: tag,
                    rating: 'pg'
                }
            });

            const gifUrl = res.data?.data?.images?.original?.url;
            const title = res.data?.data?.title || `Random ${tag} GIF`;

            if (!gifUrl) throw new Error('No GIF found');

            const embed = new EmbedBuilder()
                .setTitle(`🎞️ ${title}`)
                .setImage(gifUrl)
                .setFooter({ text: `Powered by GIPHY | Tag: ${tag}` })
                .setColor('Random');

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ GIPHY API error:', error.message);
            await interaction.editReply({
                content: '❌ Failed to fetch a GIF. Try again later!',
                ephemeral: true
            });
        }
    }
};
