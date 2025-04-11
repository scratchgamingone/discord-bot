const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const statesAtoM = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO"
];

const statesNtoZ = [
    "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get the current weather for a U.S. state and town.')
        .addStringOption(option =>
            option.setName('state_am')
                .setDescription('Choose a U.S. state (A–M)')
                .setRequired(false)
                .addChoices(...statesAtoM.map(state => ({ name: state, value: state })))
        )
        .addStringOption(option =>
            option.setName('state_nz')
                .setDescription('Choose a U.S. state (N–Z)')
                .setRequired(false)
                .addChoices(...statesNtoZ.map(state => ({ name: state, value: state })))
        )
        .addStringOption(option =>
            option.setName('town')
                .setDescription('Enter a town (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const weatherApiKey = process.env.weather_api;
        const ninjasApiKey = process.env.NINJAS_API;

        const stateAM = interaction.options.getString('state_am');
        const stateNZ = interaction.options.getString('state_nz');
        let state = stateAM || stateNZ;

        let town = interaction.options.getString('town');

        // If state not provided, pick random
        if (!state) {
            const allStates = [...statesAtoM, ...statesNtoZ];
            state = allStates[Math.floor(Math.random() * allStates.length)];
            await interaction.reply(`🎲 No state picked! I randomly selected **${state}**.`);
        } else {
            await interaction.reply(`✅ State selected: **${state}**`);
        }

        // If town not provided, fetch a valid one
        if (!town) {
            town = await findValidTown(state, ninjasApiKey, weatherApiKey);
            await interaction.followUp(`🎲 No town given. I picked **${town}**.`);
        }

        const locationQuery = `${town},${state},US`;
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationQuery)}&limit=1&appid=${weatherApiKey}`;

        try {
            const geoRes = await axios.get(geoUrl);
            const { lat, lon } = geoRes.data[0];

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;
            const weatherRes = await axios.get(weatherUrl);
            const data = weatherRes.data;

            const toF = c => (c * 9 / 5 + 32).toFixed(1);
            const toMPH = mps => (mps * 2.23694).toFixed(1);

            const reply = `
**${getWeatherEmoji(data.weather[0].main)} Weather in ${data.name}, US:**
- **Condition:** ${data.weather[0].description}
- **Temperature:** ${data.main.temp.toFixed(2)}°C / ${toF(data.main.temp)}°F
- **Feels Like:** ${data.main.feels_like.toFixed(2)}°C / ${toF(data.main.feels_like)}°F
- **Humidity:** ${data.main.humidity}%
- **Wind:** ${data.wind.speed.toFixed(1)} m/s / ${toMPH(data.wind.speed)} mph
            `;

            await interaction.followUp(reply);
        } catch (err) {
            console.error("❌ Weather fetch error:", err.response?.data || err.message);
            await interaction.followUp("❌ Failed to get weather.");
        }
    }
};

// 🔹 Tries real towns from API Ninjas until OpenWeatherMap accepts one
async function findValidTown(state, ninjasKey, weatherKey) {
    const url = `https://api.api-ninjas.com/v1/city?state=${state}&country=US&limit=50`;

    try {
        const res = await axios.get(url, {
            headers: { 'X-Api-Key': ninjasKey }
        });

        let towns = res.data.map(entry => entry.name);
        if (!towns.length) return "Springfield";

        // Shuffle the town list
        for (let i = towns.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [towns[i], towns[j]] = [towns[j], towns[i]];
        }

        // Try each town until one works with OpenWeatherMap
        for (const town of towns) {
            const query = `${town},${state},US`;
            const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${weatherKey}`;
            try {
                const geoRes = await axios.get(geoUrl);
                if (geoRes.data.length > 0) {
                    return town;
                }
            } catch (err) {
                continue;
            }
        }

        return "Springfield"; // fallback
    } catch (err) {
        console.error("❌ Town fetch error:", err.message);
        return "Springfield";
    }
}

// 🔹 Converts condition into emoji
function getWeatherEmoji(main) {
    const map = {
        Thunderstorm: '⛈️', Drizzle: '🌦️', Rain: '🌧️', Snow: '❄️',
        Clear: '☀️', Clouds: '☁️', Mist: '🌫️', Smoke: '💨',
        Haze: '🌫️', Dust: '🌬️', Fog: '🌁', Sand: '🏜️',
        Ash: '🌋', Squall: '🌪️', Tornado: '🌪️'
    };
    return map[main] || '🌈';
}
