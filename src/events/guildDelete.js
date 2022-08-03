const reactions = require('../utils/reactions.js');

module.exports = {
	name: 'guildDelete',
	once: false,
	execute: async (guild) => {
        reactions.removeGuild(guild.id)
	}
};