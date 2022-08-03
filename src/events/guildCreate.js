const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'guildCreate',
	once: false,
	execute: async (guild) => {
        console.log('Started refreshing application (/) commands.');

        const rest = new REST({ version: '10' }).setToken(client.token);
        await register(guild.client, guild.id, rest);

        console.log(`Successfully reloaded application (/) commands.`);

	}
};

function register(client, guildId, rest) {
    return new Promise(async (resolve, reject) => {
        const commandsPath = path.join(__dirname, '../rest/commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        const commands = []

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const commandJs = require(filePath);

            const command = await commandJs.execute(client, guildId)
            if (command != null) commands.push(command);
        }

        try {
            await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}