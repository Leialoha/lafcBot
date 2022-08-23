const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fetchFiles = require('./utils/fetchFiles');

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildScheduledEvents,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
] });

//
// Event handling
//
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fetchFiles(eventsPath, ['.js'], new RegExp('^-'));

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