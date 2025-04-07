const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType
} = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get the current weather for a U.S. state and town.'),

    async execute(interaction) {
        const apiKey = process.env.weather_api;

        const states = [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
            "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
            "VA", "WA", "WV", "WI", "WY"
        ];

        const menu1 = new StringSelectMenuBuilder()
            .setCustomId('select_us_state_1')
            .setPlaceholder('Choose a U.S. state (A–M)')
            .addOptions(states.slice(0, 25).map(state => ({ label: state, value: state })));

        const menu2 = new StringSelectMenuBuilder()
            .setCustomId('select_us_state_2')
            .setPlaceholder('Choose a U.S. state (N–Z)')
            .addOptions(states.slice(25).map(state => ({ label: state, value: state })));

        const row1 = new ActionRowBuilder().addComponents(menu1);
        const row2 = new ActionRowBuilder().addComponents(menu2);

        await interaction.reply({
            content: `📍 Please select a U.S. state:`,
            components: [row1, row2],
            flags: 1 << 6 // ephemeral
        });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 30_000,
            max: 1
        });

        collector.on('collect', async (selectInteraction) => {
            const selectedState = selectInteraction.values[0];

            await selectInteraction.update({
                content: `✅ You selected **${selectedState}**.\n💬 Now, what town in **${selectedState}** do you want the weather for? Type it below:`,
                components: []
            });

            const msgFilter = m => m.author.id === interaction.user.id;
            const msgCollector = interaction.channel.createMessageCollector({
                filter: msgFilter,
                time: 30_000,
                max: 1
            });

            msgCollector.on('collect', async (msg) => {
                const town = msg.content.trim();
                try {
                    const locationQuery = `${town},${selectedState},US`;
                    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationQuery)}&limit=1&appid=${apiKey}`;
                    const geoRes = await axios.get(geoUrl);

                    if (!geoRes.data.length) {
                        return msg.reply(`❌ Could not find weather for **${town}, ${selectedState}**. Please try again.`);
                    }

                    const { lat, lon } = geoRes.data[0];
                    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
                    const weatherRes = await axios.get(weatherUrl);
                    const data = weatherRes.data;

                    // Conversions
                    const toF = c => (c * 9 / 5 + 32).toFixed(1);
                    const toMPH = mps => (mps * 2.23694).toFixed(1);

                    const tempC = data.main.temp.toFixed(2);
                    const tempF = toF(data.main.temp);
                    const feelsC = data.main.feels_like.toFixed(2);
                    const feelsF = toF(data.main.feels_like);
                    const windMS = data.wind.speed.toFixed(1);
                    const windMPH = toMPH(data.wind.speed);

                    const condition = data.weather[0].description;
                    const icon = getWeatherEmoji(data.weather[0].main);

                    const reply = `
**${icon} Weather in ${data.name}, US:**
- **Condition:** ${condition}
- **Temperature:** ${tempC}°C / ${tempF}°F
- **Feels Like:** ${feelsC}°C / ${feelsF}°F
- **Humidity:** ${data.main.humidity}%
- **Wind:** ${windMS} m/s / ${windMPH} mph
                    `;

                    await msg.reply(reply);
                } catch (err) {
                    console.error('❌ Weather fetch error:', err.response?.data || err.message);
                    await msg.reply('❌ Failed to fetch weather. Try again later.');
                }
            });

            msgCollector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({
                        content: '⏱️ You didn’t type a town in time.',
                        ephemeral: true
                    });
                }
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: '⏱️ You didn’t select a state in time.',
                    components: []
                });
            }
        });
    }
};

// ✅ Emoji Mapper
function getWeatherEmoji(main) {
    const map = {
        Thunderstorm: '⛈️',
        Drizzle: '🌦️',
        Rain: '🌧️',
        Snow: '❄️',
        Clear: '☀️',
        Clouds: '☁️',
        Mist: '🌫️',
        Smoke: '💨',
        Haze: '🌫️',
        Dust: '🌬️',
        Fog: '🌁',
        Sand: '🏜️',
        Ash: '🌋',
        Squall: '🌪️',
        Tornado: '🌪️'
    };
    return map[main] || '🌈';
}
