const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions] });

//
// Event handling
//
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

//
// Client functions
//
module.exports.startup = (token) => {
    client.login(token)
}

module.exports.preShutdown = () => {

}

module.exports.shutdown = () => {
	client.destroy()
}

module.exports.getClient = function () {
	return client
}