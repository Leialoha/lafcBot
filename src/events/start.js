const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const path = require('path');
// const fs = require('fs');
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

	const rest = new REST({ version: '10' }).setToken(client.token);
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

			await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands });
		} catch (e) { console.error(e); }
	});

	console.log('Successfully reloaded application (/) commands.');
}