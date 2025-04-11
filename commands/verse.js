const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const REACTION_EMOJI = '🙏'; // You can change this to anything you like

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verse')
        .setDescription('🙏 Get a fully random Bible verse'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Add timestamp param to bust potential CDN cache
            const timestamp = Date.now();
            const res = await axios.get(`https://beta.ourmanna.com/api/v1/get/?format=json&t=${timestamp}`);
            const verseData = res.data?.verse?.details;

            if (!verseData || !verseData.text || !verseData.reference) {
                return interaction.editReply('❌ Could not fetch a valid verse. Please try again later.');
            }

            const embed = new EmbedBuilder()
                .setTitle('📖 Random Bible Verse')
                .setDescription(`*"${verseData.text.trim()}"*`)
                .setFooter({ text: verseData.reference })
                .setColor(0x88C9BF);

            const sentMessage = await interaction.editReply({ embeds: [embed] });

            // React with the emoji
            const message = await interaction.fetchReply();
            message.react(REACTION_EMOJI);

        } catch (err) {
            console.error('Verse fetch error:', err.message);
            await interaction.editReply('❌ Failed to fetch a verse. Please try again later.');
        }
    }
};
