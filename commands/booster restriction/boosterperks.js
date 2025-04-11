const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boosterping')
        .setDescription('A special command only for boosters!'),

    async execute(interaction) {
        const boosterRoleId = process.env.BOOSTER_ROLE_ID;
        const member = interaction.guild.members.cache.get(interaction.user.id);

        if (!member.roles.cache.has(boosterRoleId)) {
            return interaction.reply({
                content: '🚫 This command is only for server boosters!',
                ephemeral: true
            });
        }

        await interaction.reply(`🚀 Booster Perk Activated! Thanks for boosting, <@${interaction.user.id}>!`);
    }
};
