const { InteractionType } = require("discord.js");

module.exports = {
	getCommand: (client, guild) => {
		return {
			name: __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase(),
			// description: 'Example command',
			type: 3
		}
	},

	runMessageMenu: async (interaction) => {
		if (!interaction.isMessageContextMenuCommand()) return; // NOT NEEDED, JUST FOR SAFETY
		if (interaction.commandName != __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase()) return;

		interaction.reply('Hey there!')
		// ADD YOUR COMMAND INTERACTION HERE
	},
}
