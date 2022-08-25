const InteractionType = Object.freeze({
	SlashCommand: Symbol(1),
	ContextMenu: Symbol(2),
	MessageContextMenu: Symbol(3),
	UserContextMenu: Symbol(4),
	Button: Symbol(5),
	Modal: Symbol(6)
});

module.exports = {
	name: 'interactionCreate',
	once: false,
	execute: (interaction) => {
		const client = interaction.client;
		const type = getType(interaction);

		switch (type) {
			case (InteractionType.SlashCommand): client.slashCommands.get(interaction.commandName).runCommand(interaction); break;
			case (InteractionType.MessageContextMenu): client.messageMenus.get(interaction.commandName).runMessageMenu(interaction); break;
			case (InteractionType.Button): client.buttons.each(button => button.runButton(interaction)); break;
			case (InteractionType.Modal): client.modals.each(modal => modal.runModal(interaction)); break;
		}
	}
}

function getType(interaction) {
	if (interaction.isChatInputCommand()) return InteractionType.SlashCommand;
	// if (interaction.isContextMenuCommand()) return InteractionType.ContextMenu;
	if (interaction.isMessageContextMenuCommand()) return InteractionType.MessageContextMenu;
	if (interaction.isUserContextMenuCommand()) return InteractionType.UserContextMenu;
	if (interaction.isButton()) return InteractionType.Button;
	if (interaction.type == 5) return InteractionType.Modal;
}