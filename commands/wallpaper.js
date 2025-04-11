const {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ComponentType
} = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallpaper')
        .setDescription('🖼️ Get a random wallpaper by resolution')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('Optional keyword to search wallpapers (e.g., nature, cyberpunk)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const keyword = interaction.options.getString('keyword') || '';

        const resolutionMenu = new StringSelectMenuBuilder()
            .setCustomId('select_resolution_img')
            .setPlaceholder('📐 Choose your screen resolution')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('1920x1080 (Full HD)').setValue('1920x1080'),
                new StringSelectMenuOptionBuilder().setLabel('2560x1440 (QHD)').setValue('2560x1440'),
                new StringSelectMenuOptionBuilder().setLabel('3840x2160 (4K UHD)').setValue('3840x2160'),
                new StringSelectMenuOptionBuilder().setLabel('1280x720 (HD)').setValue('1280x720'),
                new StringSelectMenuOptionBuilder().setLabel('1080x1920 (Vertical)').setValue('1080x1920')
            );

        const row = new ActionRowBuilder().addComponents(resolutionMenu);

        await interaction.reply({
            content: `🔎 Choose your resolution${keyword ? ` for **"${keyword}"**` : ''}:`,
            components: [row],
            ephemeral: false // public so collector can detect it
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id && i.customId === 'select_resolution_img',
            componentType: ComponentType.StringSelect,
            time: 30_000,
            max: 1
        });

        collector.on('collect', async (i) => {
            const resolution = i.values[0];

            await i.update({
                content: `🔍 Fetching wallpaper for **${resolution}**...`,
                components: []
            });

            try {
                const res = await axios.get('https://wallhaven.cc/api/v1/search', {
                    params: {
                        q: keyword || '',
                        categories: '111',
                        purity: '100',
                        sorting: 'random',
                        atleast: resolution
                    }
                });

                const results = res.data.data;
                const exactMatches = results.filter(wp => wp.resolution === resolution);

                if (!exactMatches.length) {
                    return await i.followUp({
                        content: `❌ No exact wallpapers found for **"${keyword}"** at **${resolution}**.`,
                        ephemeral: true
                    });
                }

                const selected = exactMatches[Math.floor(Math.random() * exactMatches.length)];

                const embed = new EmbedBuilder()
                    .setTitle('🖼️ Your Exact Resolution Wallpaper')
                    .setImage(selected.path)
                    .setURL(selected.url)
                    .setColor(0x00AEFF)
                    .setFooter({ text: `Resolution: ${selected.resolution}` });

                await i.followUp({ embeds: [embed] });

            } catch (err) {
                console.error('Wallpaper API error:', err.message);
                await i.followUp({
                    content: '❌ Failed to fetch wallpaper. Try again later.',
                    ephemeral: true
                });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: '⏳ You didn’t choose a resolution in time.',
                    components: []
                }).catch(() => {});
            }
        });
    }
};
