const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomyoutubevideo')
        .setDescription('Get a random YouTube video or Short, optionally based on a keyword')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('Optional keyword to search for')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('shorts')
                .setDescription('Do you want YouTube Shorts?')
                .setRequired(false)
        ),

    async execute(interaction) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const keyword = interaction.options.getString('keyword') || 'random video';
        const shortsMode = interaction.options.getBoolean('shorts') ?? false;

        if (!apiKey) {
            return interaction.reply({
                content: '❌ Missing YouTube API key in `.env` file.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        // This function always uses the original keyword + shorts flag
        async function fetchRandomVideoLink(searchKeyword, useShorts) {
            const finalQuery = useShorts ? `${searchKeyword} shorts` : searchKeyword;

            const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: apiKey,
                    q: finalQuery,
                    part: 'snippet',
                    maxResults: 25,
                    type: 'video',
                    videoEmbeddable: 'true'
                }
            });

            let videos = res.data.items;

            if (useShorts) {
                // Narrow down to videos that are most likely shorts
                videos = videos.filter(v =>
                    v.snippet.title.toLowerCase().includes('short') ||
                    v.snippet.description.toLowerCase().includes('short')
                );
            }

            if (videos.length === 0) return null;

            const randomVideo = videos[Math.floor(Math.random() * videos.length)];
            return `https://www.youtube.com/watch?v=${randomVideo.id.videoId}`;
        }

        // Initial fetch
        const initialVideo = await fetchRandomVideoLink(keyword, shortsMode);
        if (!initialVideo) {
            return interaction.editReply('😢 No videos found. Try a different keyword.');
        }

        const button = new ButtonBuilder()
            .setCustomId('get_another_video')
            .setLabel('🔄 Get Another')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        const reply = await interaction.editReply({
            content: initialVideo,
            components: [row]
        });

        const collector = reply.createMessageComponentCollector({
            time: 60_000,
            max: 5,
            filter: i => i.user.id === interaction.user.id
        });

        collector.on('collect', async (btnInteraction) => {
            await btnInteraction.deferUpdate();

            const newVideo = await fetchRandomVideoLink(keyword, shortsMode);
            if (newVideo) {
                await interaction.editReply({
                    content: newVideo,
                    components: [row]
                });
            } else {
                await interaction.editReply({
                    content: '❌ No more videos found. Try again later.',
                    components: []
                });
                collector.stop();
            }
        });

        collector.on('end', () => {
            interaction.editReply({
                components: []
            }).catch(() => {});
        });
    }
};
