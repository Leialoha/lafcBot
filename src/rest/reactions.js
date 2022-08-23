const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const createdInteractions = []

module.exports = {
	getCommand: (client, guild) => {
		if (guild.id != '1004470728638337034') return null;

		return {
			name: __filename.split('/').pop().replace(/\.js$/gi, ''),
			description: 'Edit the reaction roles!',
		}
	},

	runCommand: async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		if (interaction.commandName != __filename.split('/').pop().replace(/\.js$/gi, '')) return;

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
		interaction.deferUpdate();

		if (filteredInteractions[0].checkUser(interaction.user)) filteredInteractions[0].updateInteraction(interaction.customId.replace(/react\-/gi, ''));
	}
}

function reactionInteraction(interaction, message, validUntil) {
	this.interaction = interaction;
	this.messageId = message.id;
	this.validUntil = validUntil;
	this.menuId = 'main';

	this.collector = null;

	this.checkMessage = (message) => {
		return this.messageId == message.id;
	}

	this.checkUser = (user) => {
		return this.interaction.user.id == user.id;
	}

	this.updateInteraction = async (buttonId) => {
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
			case 'cancel':
				await this.interaction.deleteReply();
				return;
		}

		this.renderMenu();
	}

	this.renderMenu = async () => {
		if (this.collector != null && !this.collector.ended) this.collector.end()

		let embeds = []
		let components = []

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
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nWhat will be the \`group id\`?\n*The group id is what you will refer to when making future interactions.*\n\nPlease type in chat for this question.`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-cback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				awaitMessage = true;
				break;
			case 'create-role':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nWhich group do you want to edit?\nPlease provide the \`group id\`!\n\nPlease type in chat for this question.`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-cback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				awaitMessage = true;
				break;
			case 'edit-group':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nWhich group do you want to edit?\nPlease provide the \`group id\`!\n\nPlease type in chat for this question.`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-eback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				awaitMessage = true;
				break;
			case 'edit-role':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nWhich group do you want to edit?\nPlease provide the \`group id\`!\n\nPlease type in chat for this question.`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-eback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				awaitMessage = true;
				break;
			case 'delete-group':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nWhich group do you want to delete?\nPlease provide the \`group id\`!\n\nPlease type in chat for this question.`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-dback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				awaitMessage = true;
				break;
			case 'delete-role':
				embeds.push(new EmbedBuilder()
					.setTitle('Reaction Roles')
					.setDescription(`*This interaction will expire <t:${timeLeft}:R>.*\n\nWhich group do you want to edit?\nPlease provide the \`group id\`!\n\nPlease type in chat for this question.`));

				components.push(new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder().setCustomId('react-dback').setEmoji('📂').setLabel('Back').setStyle(ButtonStyle.Secondary),
					));

				awaitMessage = true;
				break;
		}

		this.interaction.editReply({ embeds, components })
			.then(() => {
				if (!awaitMessage) return;

				this.fetchReply();
			});
	}

	this.fetchReply = () => {
		let filter = (message) => this.checkUser(message.author);
		let time = (Math.floor(this.validUntil.getTime() / 1000) - Math.floor((new Date()).getTime() / 1000)) * 1000;

		this.collector = this.interaction.channel.createMessageCollector({ filter, time, max: 1 });
		this.collector.on('collect', (message) => {
			let cnt = message.content;
			message.delete();
		});
	}
}