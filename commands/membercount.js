const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('👥 Shows how many members are in this server'),

    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            return interaction.reply('❌ This command can only be used in a server.');
        }

        await guild.members.fetch(); // Ensure all members are cached

        const total = guild.memberCount;
        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = total - humans;

        const embed = new EmbedBuilder()
            .setTitle('📊 Member Count')
            .setColor(0x00AEFF)
            .setDescription(`**Total Members:** ${total}\n👤 Humans: ${humans}\n🤖 Bots: ${bots}`)
            .setFooter({ text: `${guild.name}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
