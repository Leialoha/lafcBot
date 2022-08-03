const reactions = require('../rest/commands/reaction.js');

module.exports = {
	name: 'messageReactionAdd',
	once: false,
	execute: async (messageReaction, user) => {
		if (user.bot) return;
        reactions.react(messageReaction, user);
	}
};
