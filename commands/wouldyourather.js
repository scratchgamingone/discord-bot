const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wouldyourather')
        .setDescription('Get a random "Would You Rather?" question'),

    async execute(interaction) {
        const questions = [
            ['be able to fly', 'be invisible'],
            ['live without music', 'live without video games'],
            ['have super strength', 'have super speed'],
            ['only eat pizza forever', 'never eat pizza again'],
            ['live in the future', 'live in the past'],
            ['be always 10 minutes late', 'always 20 minutes early'],
            ['talk to animals', 'speak every human language'],
            ['never use social media again', 'never watch TV again'],
            ['be a famous actor', 'be a famous musician'],
            ['fight 100 duck-sized horses', '1 horse-sized duck']
        ];

        const [option1, option2] = questions[Math.floor(Math.random() * questions.length)];

        await interaction.reply(`🤔 **Would you rather...**\n🔵 ${option1}\n🔴 ${option2}`);
    }
};
