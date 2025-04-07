const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('🧹 Delete a number of messages from a channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1–100)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const requiredRoleId = process.env.REQUIRED_TO_PURGE_ROLE;
        const logChannelId = process.env.PURGE_LOG_CHANNEL_ID;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: '❌ Please provide a number between 1 and 100.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: amount });
            const deleted = await interaction.channel.bulkDelete(fetchedMessages, true);

            // Log deleted messages
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    for (const [, msg] of deleted) {
                        const embed = new EmbedBuilder()
                            .setTitle('🗑️ Message Deleted')
                            .addFields(
                                { name: 'Author', value: `${msg.author.tag} (${msg.author.id})`, inline: true },
                                { name: 'Channel', value: `<#${msg.channel.id}>`, inline: true },
                                { name: 'Content', value: msg.content || '*No content*' }
                            )
                            .setFooter({ text: `Deleted by ${interaction.user.tag}` })
                            .setTimestamp()
                            .setColor('Red');
                        await logChannel.send({ embeds: [embed] }).catch(() => {});
                    }
                }
            }

            await interaction.editReply(`✅ Successfully deleted ${deleted.size} messages.`);
        } catch (error) {
            console.error('❌ Error while deleting messages:', error);
            await interaction.editReply('❌ Failed to delete messages. Make sure they are not older than 14 days.');
        }
    }
};
