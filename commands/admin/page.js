const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('page')
        .setDescription('Page (ping) a user multiple times with a reason (management only)')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ping')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('times')
                .setDescription('Number of times to ping (max 10)')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const times = interaction.options.getInteger('times');
        const managementRoleId = process.env.management_role_id;
        const userId = interaction.user.id;

        const now = Date.now();
        const cooldown = cooldowns.get(userId);
        if (cooldown && now - cooldown < 30_000) {
            const secondsLeft = Math.ceil((30_000 - (now - cooldown)) / 1000);
            return interaction.reply({
                content: `🕒 Please wait ${secondsLeft} more second(s) before using /page again.`,
                ephemeral: true
            });
        }

        if (!interaction.member.roles.cache.has(managementRoleId)) {
            return interaction.reply({
                content: '⛔ You don’t have permission to use this command.',
                ephemeral: true
            });
        }

        if (times < 1 || times > 10) {
            return interaction.reply({
                content: '❌ Please choose a number between 1 and 10.',
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('page_reason_modal')
            .setTitle('Reason for Paging');

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason_input')
            .setLabel('Why are you paging this user?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(200);

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 60_000,
            filter: i => i.user.id === interaction.user.id && i.customId === 'page_reason_modal'
        }).catch(() => null);

        if (!submitted) {
            return interaction.followUp({
                content: '⏱️ You didn’t provide a reason in time.',
                ephemeral: true
            });
        }

        const reason = submitted.fields.getTextInputValue('reason_input');
        const author = submitted.user;

        // Public confirmation (first message)
        await submitted.reply(`📟 Paging ${target} **${times}** time(s)...`);

        // Send public pings
        for (let i = 0; i < times; i++) {
            await interaction.channel.send(`${target} — 📢 Reason: ${reason} (paged by ${author})`);
        }

        cooldowns.set(userId, now);
    }
};
