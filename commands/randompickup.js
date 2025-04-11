const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randompickup')
        .setDescription('Need help flirting? Get a random pickup line'),

    async execute(interaction) {
        const pickupLines = [
            "Are you a magician? Because whenever I look at you, everyone else disappears.",
            "Do you have a map? I just got lost in your eyes.",
            "If you were a vegetable, you’d be a cutecumber 🥒",
            "Are you Wi-Fi? Because I’m really feeling a connection.",
            "Is your name Google? Because you’ve got everything I’ve been searching for.",
            "If you were a triangle, you’d be acute one 😏",
            "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
            "If beauty were time, you’d be eternity.",
            "Are you made of copper and tellurium? Because you’re Cu-Te 💘",
            "You must be tired, because you’ve been running through my mind all day."
        ];

        const randomLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];

        await interaction.reply(`💘 **Pickup Line:** ${randomLine}`);
    }
};
