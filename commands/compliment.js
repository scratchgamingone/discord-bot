const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compliment')
        .setDescription('Get a random wholesome compliment'),

    async execute(interaction) {
        const compliments = [
            "You're like a ray of sunshine on a cloudy day ☀️",
            "You have a great sense of humor 😂",
            "You're doing amazing — don't forget that 💪",
            "You light up the room just by being in it ✨",
            "You're more helpful than you realize 🤝",
            "Your kindness is truly contagious 💖",
            "You make the world a better place 🌍",
            "You’ve got this. I believe in you 🚀",
            "You're smarter than you think 🧠",
            "You're a walking inspiration 😎"
        ];

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        await interaction.reply(`💬 **Compliment:** ${compliment}`);
    }
};
