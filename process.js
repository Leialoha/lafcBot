require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    client.user.setPresence({ activities: [{ name: 'Being rewritten...' }]});
});

client.login(process.env.TOKEN);