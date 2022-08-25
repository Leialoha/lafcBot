const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, InteractionType } = require("discord.js");

const createdInteractions = []

module.exports = {
	getCommand: (client, guild) => {
		if (guild.id != '1004470728638337034') return null;

		return {
			name: __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase(),
			description: 'Edit the reaction roles!',
		}
	},

	runCommand: async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		if (interaction.commandName != __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase()) return;

		const requiredPermissions = [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AddReactions];

		const client = interaction.client;
		const guild = interaction.guild;
		const channel = interaction.channel;

		const timeLeft = Math.ceil(interaction.createdTimestamp/1000) + 900;

		const clientAsGuildMember = await guild.members.fetch(client.user.id);
		const permissions = clientAsGuildMember.permissionsIn(channel);
		const missingPermissions = permissions.missing(requiredPermissions);

		const embeds = []
		const components = []

		if (missingPermissions.length != 0) {
			interaction.reply(`I am missing ${missingPermissions.length} ${(missingPermissions.length == 1 ) ? 'permission' : 'permissions'} for channel ${channel.toString()}.\nMissing Permissions: \`${missingPermissions.join('`, `')}\``);
		} else {
			embeds.push(new EmbedBuilder()
				.setTitle('Reaction Roles')
				.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nSelect a category to get started!`));

			components.push(new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder().setCustomId('react-mlist').setEmoji('📰').setLabel('List').setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId('react-mcreate').setEmoji('✏️').setLabel('Create').setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId('react-medit').setEmoji('⚙️').setLabel('Edit').setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId('react-mdelete').setEmoji('🗑️').setLabel('Delete').setStyle(ButtonStyle.Danger),
					new ButtonBuilder().setCustomId('react-cancel').setEmoji('❌').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
				));
				
			interaction.reply({ embeds, components, fetchReply: true })
				.then(msg => {
					createdInteractions.push(new reactionInteraction(interaction, msg, new Date(timeLeft * 1000)));
				});
		}
	},

	runButton: async (interaction) => {
		if (!interaction.isButton()) return;
		const filteredInteractions = createdInteractions.filter(reactInter => reactInter.checkMessage(interaction.message));
		
		if (filteredInteractions.length == 0) return;

		if (filteredInteractions[0].checkUser(interaction.user)) filteredInteractions[0].updateInteraction(interaction.customId.replace(/react\-/gi, ''), interaction);
		else interaction.deferUpdate();
	},

	runModal: async (interaction) => {
		if (interaction.type != InteractionType.ModalSubmit) return;
		const filteredInteractions = createdInteractions.filter(reactInter => reactInter.checkMessage(interaction.message));
		
		if (filteredInteractions.length == 0) return;

		if (filteredInteractions[0].checkUser(interaction.user)) filteredInteractions[0].updateInteraction(interaction.customId.replace(/react\-/gi, ''), interaction);
		else interaction.deferUpdate();
	}
}

function reactionInteraction(interaction, message, validUntil) {
	this.interaction = interaction;
	this.messageId = message.id;
	this.validUntil = validUntil;
	this.menuId = 'main';

	this.values = {};

	this.checkMessage = (message) => {
		return this.messageId == message.id;
	}

	this.checkUser = (user) => {
		return this.interaction.user.id == user.id;
	}

	this.updateInteraction = async (buttonId, buttonOrModalInteraction) => {
		switch (buttonId) {
			case 'mlist': this.menuId = 'list'; break;
			case 'mcreate': this.menuId = 'create'; break;
			case 'medit': this.menuId = 'edit'; break;
			case 'mdelete': this.menuId = 'delete'; break;
			case 'mback': this.menuId = 'main'; break;
			case 'cgroup': this.menuId = 'create-group'; break;
			case 'crole': this.menuId = 'create-role'; break;
			case 'egroup': this.menuId = 'edit-group'; break;
			case 'erole': this.menuId = 'edit-role'; break;
			case 'dgroup': this.menuId = 'delete-group'; break;
			case 'drole': this.menuId = 'delete-role'; break;
			case 'cback': this.menuId = 'create'; break;
			case 'eback': this.menuId = 'edit'; break;
			case 'dback': this.menuId = 'delete'; break;
			case 'cancel': await this.interaction.deleteReply(); return;
			case 'modaledit': await buttonOrModalInteraction.showModal(this.lastModal); return;
			case 'modal': buttonOrModalInteraction.fields.fields.map(field => [field.customId, field.value]).forEach(field => {this.values[field[0]] = field[1]}); break;
		}

		this.renderMenu(buttonOrModalInteraction);
	}

	this.renderMenu = async (buttonInteraction) => {
		let embeds = []
		let components = []
		let fetchReplyMsg = {};

		let timeLeft = Math.floor(this.validUntil.getTime() / 1000);
		let awaitMessage = false;

		switch (this.menuId) {
			case 'main':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nSelect a category to get started!`));
			
				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-mlist').setEmoji('📰').setLabel('List').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-mcreate').setEmoji('✏️').setLabel('Create').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-medit').setEmoji('⚙️').setLabel('Edit').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-mdelete').setEmoji('🗑️').setLabel('Delete').setStyle(ButtonStyle.Danger),
						new ButtonBuilder().setCustomId('react-cancel').setEmoji('❌').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
					));
				break;
			case 'list':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nComing Soon!`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-mback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));
				break;
			case 'create':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nCreating an element...\nPlease select the element type!`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-cgroup').setEmoji('📦').setLabel('Group').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-crole').setEmoji('🗞️').setLabel('Role').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-mback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));
				break;
			case 'edit':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nEditing an element...\nPlease select the element type!`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-egroup').setEmoji('📦').setLabel('Group').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-erole').setEmoji('🗞️').setLabel('Role').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-mback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));
				break;
			case 'delete':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nDeleting an element...\nPlease select the element type!`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-dgroup').setEmoji('📦').setLabel('Group').setStyle(ButtonStyle.Danger),
						new ButtonBuilder().setCustomId('react-drole').setEmoji('🗞️').setLabel('Role').setStyle(ButtonStyle.Danger),
						new ButtonBuilder().setCustomId('react-mback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));
				break;

			case 'create-group':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nYou are going to create a group.\n\nValues:\n${this.values['group-id'] == null ? '❌' : '✅' } \`GROUP ID\` is \`${this.values['group-id'] != null ? `${this.values['group-id']}` : '**NOT SET**'}\`\n\n*The group id is what you will refer to when making future interactions.*`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-continue').setEmoji('✅').setLabel('Continue').setStyle(ButtonStyle.Success).setDisabled(this.values['group-id'] == null),
						new ButtonBuilder().setCustomId('react-modaledit').setEmoji('🛠️').setLabel('Edit Values').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-cback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				fetchReplyMsg['group-id'] = {limit: 20, title: 'What is the new group id?'};
				// fetchReplyMsg['role-id'] = {limit: 20, title: 'What is the role id or role name?'};

				awaitMessage = true;
				break;
			case 'create-role':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nYou are going to create a role.\n\nValues:\n${this.values['group-id'] == null ? '❌' : '✅' } \`GROUP ID\` is \`${this.values['group-id'] != null ? `${this.values['group-id']}` : '**NOT SET**'}\`\n${this.values['role-id'] == null ? '❌' : '✅' } \`ROLE\` is \`${this.values['role-id'] != null ? `${this.values['role-id']}` : '**NOT SET**'}\``));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-continue').setEmoji('✅').setLabel('Continue').setStyle(ButtonStyle.Success).setDisabled(this.values['group-id'] == null && this.values['role-id'] == null),
						new ButtonBuilder().setCustomId('react-modaledit').setEmoji('🛠️').setLabel('Edit Values').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-cback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				fetchReplyMsg['group-id'] = {limit: 20, title: 'What is the group id?'};
				fetchReplyMsg['role-id'] = {limit: 20, title: 'What is the role name / id?'};

				awaitMessage = true;
				break;
			case 'edit-group':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nYou are going to edit a group.\n\nValues:\n${this.values['group-id'] == null ? '❌' : '✅' } \`GROUP ID\` is \`${this.values['group-id'] != null ? `${this.values['group-id']}` : '**NOT SET**'}\``));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-continue').setEmoji('✅').setLabel('Continue').setStyle(ButtonStyle.Success).setDisabled(this.values['group-id'] == null),
						new ButtonBuilder().setCustomId('react-modaledit').setEmoji('🛠️').setLabel('Edit Values').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-eback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				fetchReplyMsg['group-id'] = {limit: 20, title: 'What is the group id?'};
				// fetchReplyMsg['role-id'] = {limit: 20, title: 'What is the role id or role name?'};

				awaitMessage = true;
				break;
			case 'edit-role':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nYou are going to edit a role.\n\nValues:\n${this.values['group-id'] == null ? '❌' : '✅' } \`GROUP ID\` is \`${this.values['group-id'] != null ? `${this.values['group-id']}` : '**NOT SET**'}\`\n${this.values['role-id'] == null ? '❌' : '✅' } \`ROLE\` is \`${this.values['role-id'] != null ? `${this.values['role-id']}` : '**NOT SET**'}\``));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-continue').setEmoji('✅').setLabel('Continue').setStyle(ButtonStyle.Success).setDisabled(this.values['group-id'] == null && this.values['role-id'] == null),
						new ButtonBuilder().setCustomId('react-modaledit').setEmoji('🛠️').setLabel('Edit Values').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-eback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				fetchReplyMsg['group-id'] = {limit: 20, title: 'What is the group id?'};
				fetchReplyMsg['role-id'] = {limit: 20, title: 'What is the role name / id?'};

				awaitMessage = true;
				break;
			case 'delete-group':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nYou are going to delete a group.\n\nValues:\n${this.values['group-id'] == null ? '❌' : '✅' } \`GROUP ID\` is \`${this.values['group-id'] != null ? `${this.values['group-id']}` : '**NOT SET**'}\``));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-continue').setEmoji('✅').setLabel('Continue').setStyle(ButtonStyle.Success).setDisabled(this.values['group-id'] == null),
						new ButtonBuilder().setCustomId('react-modaledit').setEmoji('🛠️').setLabel('Edit Values').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-dback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				fetchReplyMsg['group-id'] = {limit: 20, title: 'What is the group id you want to delete?'};
				// fetchReplyMsg['role-id'] = {limit: 20, title: 'What is the role id or role name?'};

				awaitMessage = true;
				break;
			case 'delete-role':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nYou are going to delete a role.\n\nValues:\n${this.values['group-id'] == null ? '❌' : '✅' } \`GROUP ID\` is \`${this.values['group-id'] != null ? `${this.values['group-id']}` : '**NOT SET**'}\`\n${this.values['role-id'] == null ? '❌' : '✅' } \`ROLE\` is \`${this.values['role-id'] != null ? `${this.values['role-id']}` : '**NOT SET**'}\``));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-continue').setEmoji('✅').setLabel('Continue').setStyle(ButtonStyle.Success).setDisabled(this.values['group-id'] == null && this.values['role-id'] == null),
						new ButtonBuilder().setCustomId('react-modaledit').setEmoji('🛠️').setLabel('Edit Values').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setCustomId('react-dback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				fetchReplyMsg['group-id'] = {limit: 20, title: 'What is the group id?'};
				fetchReplyMsg['role-id'] = {limit: 20, title: 'What is the role name / id you want to delete?'};

				awaitMessage = true;
				break;
		}

		if (awaitMessage) {
			const name = __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase().split('');
			name.splice(0, 0, name.shift().toUpperCase());

			this.lastModal = new ModalBuilder()
    			.setCustomId('react-modal')
    			.setTitle(`${name.join('')} - Modal`);

			this.lastModal.addComponents(Object.entries(fetchReplyMsg).map(value => new ActionRowBuilder()
				.addComponents(new TextInputBuilder()
					.setCustomId(`${value[0].toLowerCase().replace(/ +/gi, '-')}`)
					.setLabel(value[1].title)
					.setMinLength(5)
					.setMaxLength(value[1].limit)
					.setStyle(1)
					.setRequired(true)
				)));
		}

		await buttonInteraction.deferUpdate();
		this.interaction.editReply({ embeds, components });
	}
}