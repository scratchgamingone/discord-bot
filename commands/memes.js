const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('🤣 Sends a random meme with optional SFW/NSFW filter')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Filter memes by type')
                .setRequired(false)
                .addChoices(
                    { name: 'SFW only', value: 'sfw' },
                    { name: 'NSFW only', value: 'nsfw' }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const filter = interaction.options.getString('filter') || 'sfw';
        const isNsfwChannel = interaction.channel.nsfw;

        if (filter === 'nsfw' && !isNsfwChannel) {
            return interaction.editReply('⚠️ NSFW memes are only allowed in NSFW-marked channels.');
        }

        try {
            let meme;
            let attempts = 0;

            // Try to get meme that matches filter
            while (attempts < 5) {
                const res = await axios.get('https://meme-api.com/gimme');
                const data = res.data;

                if (data?.url) {
                    const matchFilter =
                        (filter === 'nsfw' && data.nsfw) ||
                        (filter === 'sfw' && !data.nsfw);

                    if (matchFilter) {
                        meme = data;
                        break;
                    }
                }
                attempts++;
            }

            if (!meme) {
                return interaction.editReply('❌ Failed to find a meme that matches your filter. Try again.');
            }

            const embed = new EmbedBuilder()
                .setTitle(meme.title || 'Random Meme')
                .setURL(meme.postLink)
                .setImage(meme.url)
                .setFooter({ text: `👍 ${meme.ups} upvotes • r/${meme.subreddit}${meme.nsfw ? ' • 🔞 NSFW' : ''}` })
                .setColor(0xFFC300);

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('Meme fetch error:', err.message);
            await interaction.editReply('❌ Failed to fetch a meme. Try again later.');
        }
    }
};
