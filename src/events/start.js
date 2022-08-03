const config = require('../utils/config.js');
const reaction = require('../rest/commands/reaction.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

	reaction.load(client);
		client.user.setPresence({ activities: [{ name: 'Created by Leialoha' }], status: 'idle' });

		var guilds = client.guilds.cache.map(guild => guild.id);
		guilds.forEach(guild => {
		    if (config.getValue(guild) == null) {
		        config.setValue(guild, {RULES: [], ROLES: {CHANNEL: null, LIST: []}});
		    }
		});
	}
};
