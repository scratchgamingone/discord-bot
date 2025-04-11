const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder
} = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wallpaper')
    .setDescription('📱 Get a random wallpaper (auto-detects resolution)')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Choose a category like anime, people, nature, etc.')
        .addChoices(
          { name: 'Anime', value: 'anime' },
          { name: 'People', value: 'people' },
          { name: 'Nature', value: 'nature' },
          { name: 'Cyberpunk', value: 'cyberpunk' },
          { name: 'Abstract', value: 'abstract' }
        )
    )
    .addBooleanOption(option =>
      option.setName('mobile_only')
        .setDescription('Only get vertical mobile wallpapers?')
    ),

  async execute(interaction) {
    const category = interaction.options.getString('category') || 'wallpaper';
    const mobileOnly = interaction.options.getBoolean('mobile_only') || false;

    await interaction.reply({ content: '🔎 Searching for a wallpaper...', ephemeral: false });

    try {
      const res = await axios.get(`https://api.pexels.com/v1/search`, {
        headers: {
          Authorization: process.env.PEXELS_API_KEY
        },
        params: {
          query: category,
          orientation: mobileOnly ? 'portrait' : 'landscape',
          per_page: 30,
          page: Math.floor(Math.random() * 5) + 1
        }
      });

      const wallpapers = res.data.photos;
      if (!wallpapers || wallpapers.length === 0) {
        return await interaction.editReply({
          content: `❌ No wallpapers found for **${category}**.`,
        });
      }

      const random = wallpapers[Math.floor(Math.random() * wallpapers.length)];
      const imageUrl = random.src.original;

      const embed = new EmbedBuilder()
        .setTitle(`📱 Wallpaper: ${category}`)
        .setImage(imageUrl)
        .setURL(random.url)
        .setColor(0x00bfff)
        .setFooter({ text: `Photo by ${random.photographer} • Resolution: ${random.width}x${random.height}` });

      await interaction.editReply({ content: '', embeds: [embed] });

    } catch (err) {
      console.error('PEXELS API Error:', err.message);
      await interaction.editReply({
        content: '❌ Failed to fetch wallpaper. Please try again later.',
      });
    }
  }
};
