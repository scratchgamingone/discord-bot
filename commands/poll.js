const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('📊 Create a 2-option poll (random values if left blank)')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('What is the poll question?')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('optiona')
                .setDescription('Option A')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('optionb')
                .setDescription('Option B')
                .setRequired(false)
        ),

    async execute(interaction) {
        const randomQuestions = [
            'What should we eat?',
            'Best superpower?',
            'Which would you rather fight?',
            'Choose your fighter!',
            'Which is cooler?'
        ];

        const randomOptions = [
            ['Tacos 🌮', 'Pizza 🍕'],
            ['Invisibility 🫥', 'Flying 🕊️'],
            ['Shark 🦈', 'Crocodile 🐊'],
            ['Dragon 🐉', 'Unicorn 🦄'],
            ['Ice ❄️', 'Fire 🔥']
        ];

        // Get user inputs or fallback to randoms
        let question = interaction.options.getString('question');
        let optionA = interaction.options.getString('optiona');
        let optionB = interaction.options.getString('optionb');

        if (!question || !optionA || !optionB) {
            const randSet = randomOptions[Math.floor(Math.random() * randomOptions.length)];
            question = question || randomQuestions[Math.floor(Math.random() * randomQuestions.length)];
            optionA = optionA || randSet[0];
            optionB = optionB || randSet[1];
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 New Poll')
            .setDescription(`**${question}**\n\n🅰️ ${optionA}\n🅱️ ${optionB}`)
            .setColor(0x00BFFF)
            .setFooter({ text: `Poll created by ${interaction.user.username}` })
            .setTimestamp();

        const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        await pollMessage.react('🅰️');
        await pollMessage.react('🅱️');
    }
};
