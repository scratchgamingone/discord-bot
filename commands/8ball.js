const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your yes/no style question')
                .setRequired(true)
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');

        const responses = [
            '🎱 It is certain.',
            '🎱 Without a doubt.',
            '🎱 You may rely on it.',
            '🎱 Yes, definitely.',
            '🎱 As I see it, yes.',
            '🎱 Most likely.',
            '🎱 Outlook good.',
            '🎱 Yes.',
            '🎱 Signs point to yes.',
            '🎱 Reply hazy, try again.',
            '🎱 Ask again later.',
            '🎱 Better not tell you now.',
            '🎱 Cannot predict now.',
            '🎱 Don’t count on it.',
            '🎱 My reply is no.',
            '🎱 Outlook not so good.',
            '🎱 Very doubtful.'
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];

        await interaction.reply(`**Question:** ${question}\n**Answer:** ${answer}`);
    }
};
