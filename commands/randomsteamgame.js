const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomsteamgame')
        .setDescription('Get a random game from your Steam library')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Steam vanity username (not Steam ID)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const username = interaction.options.getString('username');
        const steamApiKey = process.env.steam_api_key;

        try {
            // Step 1: Get SteamID64 from vanity username
            const idRes = await axios.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/', {
                params: {
                    key: steamApiKey,
                    vanityurl: username
                }
            });

            if (!idRes.data.response.success) {
                return interaction.reply({
                    content: `❌ Could not find a Steam profile for **${username}**.`,
                    ephemeral: true
                });
            }

            const steamId = idRes.data.response.steamid;

            // Step 2: Fetch owned games
            const gamesRes = await axios.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
                params: {
                    key: steamApiKey,
                    steamid: steamId,
                    include_appinfo: true,
                    include_played_free_games: true
                }
            });

            const games = gamesRes.data.response.games;

            if (!games || games.length === 0) {
                return interaction.reply({
                    content: `😢 No games found for Steam user **${username}**.`,
                    ephemeral: true
                });
            }

            const randomGame = games[Math.floor(Math.random() * games.length)];

            await interaction.reply({
                content: `🎮 Random game from **${username}**'s Steam library:\n**${randomGame.name}**`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Steam API Error:', error.response?.data || error.message);
            await interaction.reply({
                content: '❌ Failed to fetch game info. Make sure the Steam profile is public.',
                ephemeral: true
            });
        }
    }
};
