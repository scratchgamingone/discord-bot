const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boostercount')
        .setDescription('🚀 Shows how many members are boosting this server and who they are'),

    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            return interaction.reply('❌ This command must be used inside a server.');
        }

        await guild.members.fetch(); // Ensure member cache is fully loaded

        const boosters = guild.members.cache.filter(member => member.premiumSince);
        const boosterList = boosters.map(member => `• ${member.user.tag}`).join('\n') || 'No boosters yet. 😢';

        const embed = new EmbedBuilder()
            .setTitle('🚀 Server Boosters')
            .setColor(0xFF73FA)
            .setDescription(`**Total Boosters:** ${boosters.size}\n\n${boosterList}`)
            .setFooter({ text: `${guild.name}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
