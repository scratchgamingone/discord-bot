const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomword')
        .setDescription('📄 Get a random word from the text file'),

    async execute(interaction) {
        try {
            const filePath = path.join(__dirname, 'words.txt');
            const content = fs.readFileSync(filePath, 'utf-8');

            const words = content
                .split(/\r?\n/)
                .map(word => word.trim())
                .filter(word => word.length > 0);

            if (words.length === 0) {
                return interaction.reply('⚠️ The word list is empty!');
            }

            const selected = words[Math.floor(Math.random() * words.length)];

            const embed = new EmbedBuilder()
                .setTitle('🔤 Random Word')
                .setDescription(`**${selected}**`)
                .setColor(0x4CAF50);

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('Word file error:', err.message);
            await interaction.reply('❌ Failed to load words file. Make sure `words.txt` exists in the same folder.');
        }
    }
};
