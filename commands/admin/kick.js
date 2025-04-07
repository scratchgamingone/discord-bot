const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a player from the Roblox game')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Roblox username to kick')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');

    try {
      await axios.post(process.env.ROBLOX_KICK_WEBHOOK, {
        username: username
      }, {
        headers: {
          Authorization: process.env.ROBLOX_KICK_KEY
        }
      });

      await interaction.reply(`✅ Kick request sent for **${username}**.`);
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Failed to send kick request: ${error.message}`);
    }
  }
};
