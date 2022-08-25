const { InteractionType } = require("discord.js");

module.exports = {
	getCommand: (client, guild) => {
		return {
			name: __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase(),
			description: 'Example command',
		}
	},

	runCommand: async (interaction) => {
		if (!interaction.isChatInputCommand()) return; // NOT NEEDED, JUST FOR SAFETY
		if (interaction.commandName != __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase()) return;

		// ADD YOUR COMMAND INTERACTION HERE
	},

	runButton: async (interaction) => {
		if (!interaction.isButton()) return; // NOT NEEDED, JUST FOR SAFETY
		// ADD YOUR BUTTON CHECKS HERE

		// ADD YOUR BUTTON INTERACTION HERE
	},

	runModal: async (interaction) => {
		if (!interaction.type != InteractionType.ModalSubmit) return; // NOT NEEDED, JUST FOR SAFETY
		// ADD YOUR BUTTON CHECKS HERE

		// ADD YOUR BUTTON INTERACTION HERE
	}
}
