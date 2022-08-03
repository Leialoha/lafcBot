const reactions = require('../rest/commands/reaction.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	execute: async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName == 'reaction') reactions.run(interaction);
	}
};
