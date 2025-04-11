const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randommeme')
        .setDescription('😂 Sends a random meme from Reddit'),

    async execute(interaction) {
        await interaction.deferReply(); // to allow time for fetching

        try {
            const res = await axios.get('https://www.reddit.com/r/memes/random/.json');

            const [postData] = res.data;
            const meme = postData.data.children[0].data;

            const embed = new EmbedBuilder()
                .setTitle(meme.title)
                .setImage(meme.url)
                .setURL(`https://reddit.com${meme.permalink}`)
                .setFooter({ text: `👍 ${meme.ups} | 💬 ${meme.num_comments} comments` })
                .setColor(0x00BFFF);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Meme fetch error:', error);
            await interaction.editReply('❌ Failed to fetch a meme. Try again later!');
        }
    }
};
