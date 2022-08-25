const { ActivityType } = require('discord.js');
const path = require('path');
const fetchFiles = require('../utils/fetchFiles');

const activities = [
	{ name: 'with patch v{0}', type: ActivityType.Playing },
	{ name: 'over {1} servers', type: ActivityType.Watching },
	// { name: '{2} commands', type: ActivityType.Listening },
]

module.exports = {
	name: 'ready',
	once: false,
	execute: (client) => {
		console.log(`Started bot as ${client.user.tag}`);
		registerCommands(client);

		var i = 0;
		setActivity(client, activities[i]);
		setInterval(function () {
			i = (i + 1) % activities.length;
			setActivity(client, activities[i]);
		}, 5000);
	}
}

function setActivity(client, activity) {
	activity.name = activity.name.format(client.version, client.guilds.cache.size);
	client.user.setPresence({ activities: [activity], status: 'idle' });
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
			if (typeof temp.runCommand == 'function') {
				client.slashCommands.set(filePath.split('/').pop().replace(/\.js$/gi, '').toLowerCase(), temp);
			} else if (typeof temp.runMessageMenu == 'function') {
				client.messageMenus.set(filePath.split('/').pop().replace(/\.js$/gi, '').toLowerCase(), temp);
			} else break;
			commandInteractions.push(temp);
		}
		if (typeof temp.runButton == 'function') {
			client.buttons.set(filePath.split('/').pop().replace(/\.js$/gi, '').toLowerCase(), temp);
		}
		if (typeof temp.runModal == 'function') {
			client.modals.set(filePath.split('/').pop().replace(/\.js$/gi, '').toLowerCase(), temp);
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