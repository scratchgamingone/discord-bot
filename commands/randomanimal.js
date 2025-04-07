const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomanimal')
        .setDescription('Get a random animal fact and image!'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Randomly choose animal type
            const animals = ['dog', 'fox', 'panda', 'koala', 'bird', 'raccoon', 'kangaroo'];
            const selected = animals[Math.floor(Math.random() * animals.length)];

            const res = await axios.get(`https://some-random-api.com/animal/${selected}`);
            const { fact, image } = res.data;

            const embed = new EmbedBuilder()
                .setTitle(`🐾 Random ${selected.charAt(0).toUpperCase() + selected.slice(1)}`)
                .setDescription(fact)
                .setImage(image)
                .setColor('Random');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Error fetching animal data:', error.message);
            await interaction.editReply({
                content: '❌ Failed to fetch animal info. Try again later!',
                ephemeral: true
            });
        }
    }
};
