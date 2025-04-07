const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recommendmovie')
        .setDescription('Get a random movie (optionally based on rating)')
        .addNumberOption(option =>
            option.setName('rating')
                .setDescription('Enter an exact rating (e.g., 8.2) from 0.0–10.0')
                .setRequired(false)
                .setMinValue(0.0)
                .setMaxValue(10.0)
        ),

    async execute(interaction) {
        const rating = interaction.options.getNumber('rating');
        const tmdbApiKey = process.env.TMDB_API_KEY;

        await interaction.deferReply();

        try {
            const params = {
                api_key: tmdbApiKey,
                language: 'en-US',
                sort_by: 'popularity.desc',
                include_adult: false,
                page: Math.floor(Math.random() * 10) + 1
            };

            if (rating !== null) {
                params['vote_average.gte'] = rating;
                params['vote_average.lte'] = rating;
            }

            const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });

            const results = response.data.results;

            if (!results || results.length === 0) {
                return interaction.editReply(
                    rating !== null
                        ? `😢 No movies found with exact rating **${rating}**. Try a different one.`
                        : `😢 No movies found. Try again.`
                );
            }

            const movie = results[Math.floor(Math.random() * results.length)];

            const embed = new EmbedBuilder()
                .setTitle(`${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`)
                .setDescription(movie.overview || "No plot available.")
                .setThumbnail(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null)
                .addFields(
                    { name: "⭐ Rating", value: `${movie.vote_average}`, inline: true },
                    { name: "📅 Release Date", value: movie.release_date || 'Unknown', inline: true }
                )
                .setURL(`https://www.themoviedb.org/movie/${movie.id}`);

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error fetching movie:", error);
            return interaction.editReply("🚫 An error occurred while trying to get a movie.");
        }
    }
};
