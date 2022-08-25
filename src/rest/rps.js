const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
	getCommand: (client, guild) => {
		// if (guild.id != '1004470728638337034') return null;

		return {
			name: __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase(),
			description: 'Rock Paper Scissors!',
		}
	},

	runCommand: async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		if (interaction.commandName != __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase()) return;

		const requiredPermissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages];

		const client = interaction.client;
		const guild = interaction.guild;
		const channel = interaction.channel;

		const clientAsGuildMember = await guild.members.fetch(client.user.id);
		const permissions = clientAsGuildMember.permissionsIn(channel);
		const missingPermissions = permissions.missing(requiredPermissions);

		const embeds = []
		const components = []

		if (missingPermissions.length != 0) {
			interaction.reply(`I am missing ${missingPermissions.length} ${(missingPermissions.length == 1 ) ? 'permission' : 'permissions'} for channel ${channel.toString()}.\nMissing Permissions: \`${missingPermissions.join('`, `')}\``);
		} else {
			embeds.push(new EmbedBuilder()
				.setTitle('Rock Paper Scissors')
				.setDescription(`You challenge someone to a battle!`));

			components.push(new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder().setCustomId('rock').setEmoji('🪨').setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId('paper').setEmoji('📰').setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId('scissors').setEmoji('✂️').setStyle(ButtonStyle.Secondary)
				));
				
			interaction.reply({ embeds, components, fetchReply: true })
				.then((message) => {
					const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000, maxUsers: 2 });

					let collectedResponses = {}

					collector.on('collect', (inter, collection) => {
						if (Object.keys(collectedResponses).includes(inter.user.id)) {
							inter.reply({content: `You can only click this once!`, ephemeral: true});
						} else {
							inter.deferUpdate();
							collectedResponses[inter.user.id] = {rock: '🪨', paper: '📰', scissors: '✂️'}[inter.customId];
						}

						if (Object.keys(collectedResponses).length == 2) collector.stop();
					});

					collector.on('end', async () => {
						let keys = Object.keys(collectedResponses);
						let amount = keys.length;

						embeds.forEach(embed => embeds.pop());
						components.forEach(component => components.pop());

						if (amount == 2) {
							if (collectedResponses[keys[0]] == collectedResponses[keys[1]]) {
								embeds.push(new EmbedBuilder()
									.setTitle('Rock Paper Scissors')
									.setDescription(`<@${keys[0]}> (${collectedResponses[keys[0]]}) tied with <@${keys[1]}> (${collectedResponses[keys[1]]}).`));
							} else if (collectedResponses[keys[0]] == '🪨') {
								if (collectedResponses[keys[1]] == '📰') {
									embeds.push(new EmbedBuilder()
										.setTitle('Rock Paper Scissors')
										.setDescription(`<@${keys[1]}> (${collectedResponses[keys[1]]}) had beaten <@${keys[0]}> (${collectedResponses[keys[0]]}).`));
								} else {
									embeds.push(new EmbedBuilder()
										.setTitle('Rock Paper Scissors')
										.setDescription(`<@${keys[0]}> (${collectedResponses[keys[0]]}) had beaten <@${keys[1]}> (${collectedResponses[keys[1]]}).`));
								}
							} else if (collectedResponses[keys[0]] == '📰') {
								if (collectedResponses[keys[1]] == '✂️') {
									embeds.push(new EmbedBuilder()
										.setTitle('Rock Paper Scissors')
										.setDescription(`<@${keys[1]}> (${collectedResponses[keys[1]]}) had beaten <@${keys[0]}> (${collectedResponses[keys[0]]}).`));
								} else {
									embeds.push(new EmbedBuilder()
										.setTitle('Rock Paper Scissors')
										.setDescription(`<@${keys[0]}> (${collectedResponses[keys[0]]}) had beaten <@${keys[1]}> (${collectedResponses[keys[1]]}).`));
								}
							} else if (collectedResponses[keys[0]] == '✂️') {
								if (collectedResponses[keys[1]] == '🪨') {
									embeds.push(new EmbedBuilder()
										.setTitle('Rock Paper Scissors')
										.setDescription(`<@${keys[1]}> (${collectedResponses[keys[1]]}) had beaten <@${keys[0]}> (${collectedResponses[keys[0]]}).`));
								} else {
									embeds.push(new EmbedBuilder()
										.setTitle('Rock Paper Scissors')
										.setDescription(`<@${keys[0]}> (${collectedResponses[keys[0]]}) had beaten <@${keys[1]}> (${collectedResponses[keys[1]]}).`));
								}
							}
						} else {
							embeds.push(new EmbedBuilder()
								.setTitle('Rock Paper Scissors')
								.setDescription(`${amount == 1 ? 'Only one person' : 'No one'} submitted a battle option. 😢`));
						}

						await interaction.editReply({ embeds, components })
							.then(() => {
								setTimeout(function () {
									interaction.deleteReply();
								}, 10000);
							});
					});
				});
		}
	}
}