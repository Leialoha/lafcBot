const path = require('path');
// const fs = require('fs');
const fetchFiles = require('../utils/fetchFiles');

module.exports = {
	name: 'interactionCreate',
	once: true,
	execute: (interaction) => {
		const interactionPath = path.join(__dirname, '..', 'rest');
		const interactionFiles = fetchFiles(interactionPath, ['.js'], new RegExp('^-'));

		for (const file of interactionFiles) {
			const filePath = path.join(interactionPath, file);
			const temp = require(filePath);

			if (typeof temp.runCommand == 'function') {
				if (interaction.isChatInputCommand()) temp.runCommand(interaction);
				interaction.client.on('interactionCreate', (...args) => temp.runCommand(...args));
			}

			if (typeof temp.runButton == 'function') {
				if (interaction.isButton()) temp.runButton(interaction);
				interaction.client.on('interactionCreate', (...args) => temp.runButton(...args));
			}
		}

	}
}