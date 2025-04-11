const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomyoutubevideo')
        .setDescription('Get a random YouTube video, with optional keyword or from a specific channel')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('Optional keyword to search for')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('shorts')
                .setDescription('Do you want YouTube Shorts?')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('channel_name')
                .setDescription('Search from a specific YouTube channel name (e.g., MrBeast)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const keyword = interaction.options.getString('keyword') || 'random video';
        const shortsMode = interaction.options.getBoolean('shorts') ?? false;
        const channelName = interaction.options.getString('channel_name') || null;

        if (!apiKey) {
            return interaction.reply({
                content: '❌ YouTube API key is missing in `.env`.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        // 🔍 Step 1: Get channel ID if channel name is provided
        async function getChannelIdFromName(name) {
            try {
                const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: apiKey,
                        q: name,
                        type: 'channel',
                        part: 'snippet',
                        maxResults: 1
                    }
                });

                const channel = res.data.items[0];
                return channel?.id?.channelId || null;

            } catch (err) {
                console.error('Error finding channel:', err.message);
                return null;
            }
        }

        // 🔀 Step 2: Fetch random video
        async function fetchRandomVideoLink(channelId = null) {
            try {
                const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: apiKey,
                        q: shortsMode ? `${keyword} shorts` : keyword,
                        part: 'snippet',
                        maxResults: 25,
                        type: 'video',
                        videoEmbeddable: 'true',
                        ...(channelId && { channelId })
                    }
                });

                let videos = res.data.items;

                if (shortsMode) {
                    videos = videos.filter(v =>
                        v.snippet.title.toLowerCase().includes('short') ||
                        v.snippet.description.toLowerCase().includes('short')
                    );
                }

                if (!videos.length) return null;

                const pick = videos[Math.floor(Math.random() * videos.length)];
                return `https://www.youtube.com/watch?v=${pick.id.videoId}`;

            } catch (err) {
                console.error('YouTube API error:', err.message);
                return null;
            }
        }

        // 🧠 Step 3: Lookup channel ID if needed
        const finalChannelId = channelName ? await getChannelIdFromName(channelName) : null;

        if (channelName && !finalChannelId) {
            return interaction.editReply('❌ Could not find the specified channel. Check the spelling or try another.');
        }

        const initialVideo = await fetchRandomVideoLink(finalChannelId);
        if (!initialVideo) {
            return interaction.editReply('😢 Could not find a video. Try different keywords or channel.');
        }

        // 🔁 Button Setup
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
            const newVideo = await fetchRandomVideoLink(finalChannelId);
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
