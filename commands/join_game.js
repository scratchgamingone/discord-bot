const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join_game')
    .setDescription('Get the link to play the Chaos Battleground Roblox game'),

  async execute(interaction) {
    const gameId = process.env.ROBLOX_GAME_ID;
    const gameUrl = `https://www.roblox.com/games/${gameId}`;

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Join Chaos Battleground')
        .setStyle(ButtonStyle.Link)
        .setURL(gameUrl)
    );

    await interaction.reply({
      content: 'Ready to enter the battlefield? Press the button below to launch the game:',
      components: [button]
    });
  }
};
