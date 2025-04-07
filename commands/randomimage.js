const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomimage')
        .setDescription('Get a random image from Unsplash'),

    async execute(interaction) {
        const apiKey = process.env.UNSPLASH_API_KEY;

        if (!apiKey) {
            return interaction.reply({
                content: '❌ Missing Unsplash API key in `.env` file.',
                ephemeral: true
            });
        }

        const topics = ['cat', 'dog', 'sky', 'forest', 'space', 'food', 'city', 'beach', 'technology', 'mountains'];
        const query = topics[Math.floor(Math.random() * topics.length)];

        await interaction.deferReply();

        try {
            const res = await axios.get('https://api.unsplash.com/photos/random', {
                headers: {
                    Authorization: `Client-ID ${apiKey}`
                },
                params: {
                    query: query
                }
            });

            const imageUrl = res.data?.urls?.regular;
            const photographer = res.data?.user?.name || 'Unknown';

            const embed = new EmbedBuilder()
                .setTitle(`📷 Random image: ${query}`)
                .setImage(imageUrl)
                .setFooter({ text: `Photo by ${photographer} (Unsplash)` })
                .setColor('Random');

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Unsplash error:', error.message);
            await interaction.editReply({
                content: '❌ Failed to fetch a random image. Try again later.',
                ephemeral: true
            });
        }
    }
};
