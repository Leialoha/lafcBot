const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
	getCommand: (client, guild) => {
		// if (guild.id != '1004470728638337034') return null;

		return {
			name: __filename.split('/').pop().replace(/\.js$/gi, '').toLowerCase(),
			description: 'Tic Tac Toe!',
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

		if (missingPermissions.length != 0) {
			interaction.reply(`I am missing ${missingPermissions.length} ${(missingPermissions.length == 1 ) ? 'permission' : 'permissions'} for channel ${channel.toString()}.\nMissing Permissions: \`${missingPermissions.join('`, `')}\``);
		} else {
			await interaction.deferReply();
			new TicTacToe(interaction).renderBoard();
		}
	}
}

function TicTacToe(interaction) {
	this.interaction = interaction;
	this.board = [ [ null, null, null ], [ null, null, null ], [ null, null, null ] ];
	this.players = {};

	this.turn = null;
	this.rotation = 0;

	this.collectorStarted = false;

	this.renderBoard = () => {
		const embeds = [];
		const components = [];

		let joinedPlayers = (Object.keys(this.players).length > 0) ? Object.entries(this.players).map(([key, value]) => `${value} <@${key}>\n`).join('') : '';
		let openSlots = Number.parseInt(this.board.map(value => (value[0] == null ? 1 : 0) + (value[2] == null ? 1 : 0) + (value[1] == null ? 1 : 0)).join(''));
		let checks = [
			((this.board[0][0] == this.board[0][1]) && (this.board[0][1] == this.board[0][2])) ? this.board[0][0] : null,
			((this.board[1][0] == this.board[1][1]) && (this.board[1][1] == this.board[1][2])) ? this.board[1][0] : null,
			((this.board[2][0] == this.board[2][1]) && (this.board[2][1] == this.board[2][2])) ? this.board[2][0] : null,
			((this.board[0][0] == this.board[1][0]) && (this.board[1][0] == this.board[2][0])) ? this.board[0][0] : null,
			((this.board[0][1] == this.board[1][1]) && (this.board[1][1] == this.board[2][1])) ? this.board[0][1] : null,
			((this.board[0][2] == this.board[1][2]) && (this.board[1][2] == this.board[2][2])) ? this.board[0][2] : null,
			((this.board[0][0] == this.board[1][1]) && (this.board[1][1] == this.board[2][2])) ? this.board[0][0] : null,
			((this.board[2][0] == this.board[1][1]) && (this.board[1][1] == this.board[0][2])) ? this.board[2][0] : null,
		]
		let checkSlots = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		]

		if (Object.keys(this.players).length < 2) {
			embeds.push(new EmbedBuilder()
				.setTitle('Tic Tac Toe')
				.setDescription(`Players:\n${joinedPlayers}\n**STATUS:** Awaiting players...`));
			
			components.push(new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder().setCustomId('ttt-join').setLabel('Click to join').setStyle(ButtonStyle.Primary)
				));
				
			this.interaction.editReply({ embeds, components, fetchReply: true })
				.then(msg => this.join(msg));
		} else if (openSlots == 0) {
			embeds.push(new EmbedBuilder()
				.setTitle('Tic Tac Toe')
				.setDescription(`**STATUS:** Closed\n**REASON:** Tied game`));

			for (let x = 0; x < this.board.length; x++) {
				const xBoard = this.board[x];
				var actionRow = new ActionRowBuilder();
			
				for (let y = 0; y < xBoard.length; y++) {
					const yBoard = xBoard[y];
					actionRow.addComponents(
						new ButtonBuilder().setCustomId(`ttt-${x + y*3}`).setEmoji((yBoard == null) ? '❔' : yBoard).setStyle(ButtonStyle.Secondary).setDisabled(true)
					);
				}
			
				components.push(actionRow);
			}

			this.interaction.editReply({ embeds, components, fetchReply: true });
			setTimeout((interaction) => {
				interaction.deleteReply();
			}, 10000, this.interaction);
		} else if (checks.some(check => Object.values(this.players).includes(check))) {
			let winner = checks.some(check => this.players[Object.keys(this.players)[0]] == check) ? Object.keys(this.players)[0] : Object.keys(this.players)[1];
			let paths = []
			checks.map((value, index) => (value == this.players[winner]) ? index : null).filter(value => value != null).map(value => checkSlots[value]).forEach(value => paths = paths.concat(value));

			embeds.push(new EmbedBuilder()
				.setTitle('Tic Tac Toe')
				.setDescription(`**STATUS:** Closed\n**REASON:** Game won\n**WINNER:** <@${winner}>`));

			for (let x = 0; x < this.board.length; x++) {
				const xBoard = this.board[x];
				var actionRow = new ActionRowBuilder();
			
				for (let y = 0; y < xBoard.length; y++) {
					const yBoard = xBoard[y];
					const style = (paths.includes(x + y*3)) ? ButtonStyle.Success : ButtonStyle.Secondary;

					actionRow.addComponents(
						new ButtonBuilder().setCustomId(`ttt-${x + y*3}`).setEmoji((yBoard == null) ? '❔' : yBoard).setStyle(style).setDisabled(true)
					);
				}
			
				components.push(actionRow);
			}

			this.interaction.editReply({ embeds, components, fetchReply: true });
			setTimeout((interaction) => {
				interaction.deleteReply();
			}, 10000, this.interaction);
		} else {
			embeds.push(new EmbedBuilder()
				.setTitle('Tic Tac Toe')
				.setDescription(`Players:\n${joinedPlayers}\nTurn: <@${this.turn}>`));

			for (let x = 0; x < this.board.length; x++) {
				const xBoard = this.board[x];
				var actionRow = new ActionRowBuilder();

				for (let y = 0; y < xBoard.length; y++) {
					const yBoard = xBoard[y];
					actionRow.addComponents(
						new ButtonBuilder().setCustomId(`ttt-${x + y*3}`).setEmoji((yBoard == null) ? '❔' : yBoard).setStyle(ButtonStyle.Secondary).setDisabled(yBoard != null)
					);
				}

				components.push(actionRow);
			}

			this.interaction.editReply({ embeds, components, fetchReply: true })
				.then(msg => this.click(msg));
		}
	}

	this.join = (message) => {
		if (this.collectorStarted) return;
		this.collectorStarted = true;

		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

		collector.on('collect', (inter, collection) => {
			if (Object.keys(this.players).includes(inter.user.id)) inter.reply({content: `You already joined this game!`, ephemeral: true});
			else {
				inter.deferUpdate();
				this.players[inter.user.id] = ['❌', '⭕'][Object.keys(this.players).length];

				if (Object.keys(this.players).length == 2) {
					collector.stop();
					this.turn = Object.keys(this.players);
					this.turn = this.turn[Math.floor(Math.random()*this.turn.length)];
				}

				this.rotation += 1;
				this.renderBoard();
			}
		});

		collector.on('end', (collection, reason) => {
			if (reason == 'time') {
				const embeds = [];
				const components = [];

				embeds.push(new EmbedBuilder()
					.setTitle('Tic Tac Toe')
					.setDescription(`**STATUS:** Closed\n**REASON:** Game didn't start after 30 seconds!`));

				this.interaction.editReply({ embeds, components, fetchReply: true });
				setTimeout((interaction) => {
					interaction.deleteReply();
				}, 10000, this.interaction);
			}
		});
	}

	this.click = (message) => {
		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

		collector.on('collect', (inter, collection) => {
			buttonId = Number.parseInt(inter.customId.replace(/^ttt\-/gi, ''));
			xButton = buttonId % 3;
			yButton = (buttonId - xButton) / 3;

			inter.deferUpdate();
			
			if (inter.user.id != this.turn) return;
			if (this.board[xButton][yButton] != null) return;

			this.board[xButton][yButton] = this.players[this.turn];
			this.turn = Object.keys(this.players).filter(p => p != this.turn)[0];

			this.renderBoard();
			collector.stop();
		});

		collector.on('end', (collection, reason) => {
			if (reason == 'time') {
				const embeds = [];
				const components = [];

				embeds.push(new EmbedBuilder()
					.setTitle('Tic Tac Toe')
					.setDescription(`**STATUS:** Closed\n**REASON:** <@${this.turn}> took forever to respond!`));

				this.interaction.editReply({ embeds, components });
				setTimeout((interaction) => {
					interaction.deleteReply();
				}, 10000, this.interaction);
			}
		});
	}
}