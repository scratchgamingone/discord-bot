const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomjoke')
        .setDescription('Get a random joke (safe for work)'),

    async execute(interaction) {
        const apiKey = process.env.joke_api_key;

        if (!apiKey) {
            return interaction.reply({
                content: '❌ Joke API key missing from `.env`.',
                ephemeral: true
            });
        }

        try {
            const res = await axios.get(`https://v2.jokeapi.dev/joke/Any?type=single`);
            const joke = res.data?.joke || 'No joke found 😅';

            await interaction.reply(joke);
        } catch (err) {
            console.error('❌ Joke API error:', err.message);
            await interaction.reply({
                content: '❌ Failed to fetch a joke. Try again later.',
                ephemeral: true
            });
        }
    }
};
