const path = require('path');
const fetchFiles = require('../utils/fetchFiles');

module.exports = {
	name: 'ready',
	once: false,
	execute: (client) => {
		console.log(`Started bot as ${client.user.tag}`);
		client.user.setPresence({ activities: [{ name: `with patch v${client.version}` }], status: 'idle' });
		registerCommands(client);
	}
}

async function registerCommands(client) {
	console.log('Started refreshing application (/) commands.');

	const guilds = client.guilds.cache;
	const commandInteractions = [];
	const tempPath = path.join(__dirname, '..', 'rest');
	const tempFiles = fetchFiles(tempPath, ['.js'], new RegExp('^-'));
	
	for (const file of tempFiles) {
		const filePath = path.join(tempPath, file);
		const temp = require(filePath);
		if (typeof temp.getCommand == 'function') {
			commandInteractions.push(temp)
		}
	}

	await guilds.each(async (guild) => {
		const commands = []
		try {
			commandInteractions.forEach(cmdInter => {
				const val = cmdInter.getCommand(client, guild);
				if (val != null) commands.push(val);
			});

			await guild.commands.set(commands);
		} catch (e) { console.error(e); }
	});

	console.log('Successfully reloaded application (/) commands.');
}