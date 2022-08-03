const path = require('path');
const fs = require('fs');
const bot = require('../bot.js');
const { EmbedBuilder } = require('discord.js');

var location = null;
var reactions = {};

module.exports.setFile = (file) => {
    if (file == null) file = 'reactions.json';
    if (location == null) location = path.join(__dirname, '../../', file);
}

module.exports.load = () => {
    try {
        fs.accessSync(location, fs.constants.F_OK);
    } catch (e) {
        fs.writeFileSync(location, '{}');
    }

    const data = fs.readFileSync(location);
    reactions = JSON.parse(data);
}

module.exports.save = () => {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.stringify(reactions);
            fs.writeFileSync(location, data);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

module.exports.clear = (guildId) => {
    reactions[guildId] = {};
}

//
// Groups
//
module.exports.createGroup = async (guildId, group, channelId) => {
    const promise = new Promise(async (resolve, reject) => {
        if (reactions[guildId] == null) reactions[guildId] = {};
        if (reactions[guildId][group] == null) {
            const embeds = []
            embeds.push(new EmbedBuilder().setTitle('No title given').setDescription('No description given'))

            const guild = await bot.getClient().guilds.fetch(guildId).catch(e => reject(e.message));
            const channel = await guild.channels.fetch(channelId).catch(e => reject(e.message));
            const message = await channel.send({ embeds }).catch(e => reject(e.message));

            reactions[guildId][group] = {message: message.id, channel: channelId, title: 'No title given', description: 'No description given', limit: 0};
            resolve('Group `' + group + '` was created in <#' + channel + '>')
        }
        else reject('Group already exists!');
    });

    return promise;
}

module.exports.listGroups = async (guildId, group) => {
    if (reactions[guildId] == null) throw new Error('No groups exist!');

    var groups = reactions[guildId];
    if (group != null) {
        var entries = Object.entries(groups);
        entries = entries.filter(([key, value]) => key == group);
        groups = Object.fromEntries(entries);
    }

    return groups;
}

module.exports.modifyGroup = async (guildId, group, placeholder, value) => {
    return new Promise(async (resolve, reject) => {
        if (reactions[guildId] == null || reactions[guildId][group] == null) return reject('Group does not exist!');

        const channelId = reactions[guildId][group]['channel'];
        const messageId = reactions[guildId][group]['message'];

        var groupRoles = reactions[guildId][group]['roles'];
        if (groupRoles != null) {
            groupRoles = Object.entries(groupRoles).map(([key, value]) => {
                return '\n\n' + value['emoji'] + ' - ' + value['name']
            });
            groupRoles = groupRoles.join('');
        } else groupRoles = '';

        const embeds = []
        embeds.push(new EmbedBuilder()
            .setTitle((placeholder == 'title' && value != null) ? value : reactions[guildId][group]['title'])
            .setDescription(
                ((placeholder == 'limit' && value != null && value > 0) ? '*You can only select ' + value + ' role(s)*\n' : 
                    ((reactions[guildId][group]['limit'] > 0) ? '*You can only select ' + reactions[guildId][group]['limit'] + ' role(s)*\n' : ''))
                + ((placeholder == 'description' && value != null) ? value : reactions[guildId][group]['description'])
                + groupRoles
            ));

        const guild = await bot.getClient().guilds.fetch(guildId).catch(e => reject(e.message));
        var channel = await guild.channels.fetch(channelId).catch(e => reject(e.message));
        var message = await channel.messages.fetch(messageId).catch(e => reject(e.message));

        if (value != null) {
            switch (placeholder) {
                case 'channel':
                    channel = await guild.channels.fetch(value).catch(e => reject(e.message));
                    newMessage = await channel.send({ embeds }).catch(e => reject('I can not send messages! Please give me permissions to do so.\nPermission: `Send Messages`'));

                    reactions[guildId][group]['channel'] = channel.id;
                    reactions[guildId][group]['message'] = newMessage.id;

                    await message.delete().catch(e => reject('I can not delete messages! Please give me permissions to do so.\nPermission: `Manage Messages`'));
                    
                    groupRoles = reactions[guildId][group]['roles'];
                    groupRoles = Object.entries(groupRoles).map(([key, value]) => { return value['emoji'] });

                    await groupRoles.forEach(async (emoji) => {
                        await newMessage.react(emoji).catch(e => reject('I can not add reactions! Please give me permissions to do so.\nPermission: `Add Reactions`'));
                    })

                    break;
                case 'title':
                case 'description':
                case 'limit':
                    await message.edit({ embeds });
                    break;
            }
        }

        if (value == null) {
            var data = reactions[guildId][group][placeholder];
            if (placeholder == 'channel') data = '<#' + data + '>'
            resolve('The `' + placeholder + '` of group `' + group + '` is ' + data);
        } else {
            reactions[guildId][group][placeholder] = value;
            if (placeholder == 'channel') value = '<#' + value + '>'
            resolve('The `' + placeholder + '` of group `' + group + '` is now ' + value);
        }
    })
}

module.exports.deleteGroup = async (guildId, group, confirm) => {
    return new Promise(async (resolve, reject) => {
        if (reactions[guildId] == null || reactions[guildId][group] == null) return reject('Group does not exist!');
        if (!confirm) return reject('If you want to delete group `' + group + '`, make sure you confirm the deletion!')

        const channelId = reactions[guildId][group]['channel'];
        const messageId = reactions[guildId][group]['message'];

        const guild = await bot.getClient().guilds.fetch(guildId).catch(e => reject(e.message));
        const channel = await guild.channels.fetch(channelId).catch(e => reject(e.message));
        const message = await channel.messages.fetch(messageId).catch(e => reject(e.message));

        if (message != null) await message.delete().catch(e => reject(e.message));
        delete reactions[guildId][group]
        resolve('Deleted group `' + group + '`');
    })
}

//
// Roles
//
module.exports.createRole = (guildId, group, role, emoji, name) => {
    return new Promise(async (resolve, reject) => {
        if (reactions[guildId] == null || reactions[guildId][group] == null) return reject('Group does not exist!');
        else if (reactions[guildId][group]['roles'] == null) reactions[guildId][group]['roles'] = {}

        if ((reactions[guildId][group]['roles'][role.id] != null)) return reject('Role already exists!');
        else {
            var groupRoles = reactions[guildId][group]['roles'];
            groupRoles = Object.entries(groupRoles).filter(([key, value]) => value['emoji'] == emoji);

            if (groupRoles.length != 0) return reject('A role, in the group `' + group + '`, already has the emoji `' + emoji + '`');

            const channelId = reactions[guildId][group]['channel'];
            const messageId = reactions[guildId][group]['message'];

            const guild = await bot.getClient().guilds.fetch(guildId).catch(e => reject(e.message));
            const channel = await guild.channels.fetch(channelId).catch(e => reject(e.message));
            const message = await channel.messages.fetch(messageId).catch(e => reject(e.message));

            await message.react(emoji).catch(e => reject('One of two things went wrong...\n1) You provided an invalid emoji!\n**OR**\n2) I can not add reactions! Please give me permissions to do so.\nPermission: `Add Reactions`'));
            reactions[guildId][group]['roles'][role.id] = {emoji, name: ((name != null) ? name : role.name)};

            groupRoles = reactions[guildId][group]['roles'];
            groupRoles = Object.entries(groupRoles).map(([key, value]) => {
                return '\n\n' + value['emoji'] + ' - ' + value['name']
            });
            groupRoles = groupRoles.join('');

            const embeds = []
            embeds.push(new EmbedBuilder()
                .setTitle(reactions[guildId][group]['title'])
                .setDescription(((reactions[guildId][group]['limit'] > 0) ? '*You can only select ' + reactions[guildId][group]['limit'] + ' role(s)*\n' : '')
                    + reactions[guildId][group]['description']
                    + groupRoles ));
    
            await message.edit({ embeds });

            resolve('Added role `' + role.name + '` (in group `' + group + '`)');
        }
    })
}

module.exports.listRoles = (guildId, group, role) => {
    if (reactions[guildId] == null || reactions[guildId][group]) throw new Error('Group does not exist!');

    var roles = reactions[guildId][group];
    if (role != null) {
        var entries = Object.entries(roles);
        entries = entries.filter(([key, value]) => key == role.id);
        roles = Object.fromEntries(entries);
    }

    return roles;
}

module.exports.modifyRole = (guildId, group, role, placeholder, value) => {
    return new Promise(async (resolve, reject) => {
        if (reactions[guildId] == null || reactions[guildId][group] == null) reject('Group does not exist!');
        else if (reactions[guildId][group]['roles'] == null || reactions[guildId][group]['roles'][role.id] == null) reject('Role does not exist!');

        if (value == null) {
            var data = reactions[guildId][group]['roles'][role.id][placeholder];
            resolve('The `' + placeholder + '` of role `' + role.name + '` (in group `' + group + '`) is ' + data);
        } else {
            const channelId = reactions[guildId][group]['channel'];
            const messageId = reactions[guildId][group]['message'];

            const guild = await bot.getClient().guilds.fetch(guildId).catch(e => reject(e.message));
            const channel = await guild.channels.fetch(channelId).catch(e => reject(e.message));
            const message = await channel.messages.fetch(messageId).catch(e => reject(e.message));

            var groupRoles;

            if (placeholder == 'emoji') {
                groupRoles = reactions[guildId][group]['roles'];
                groupRoles = Object.entries(groupRoles).filter(([key, value]) => value['emoji'] == value);

                if (groupRoles.length != 0) return reject('A role, in the group `' + group + '`, already has the emoji `' + value + '`');
                await message.react(value).catch(e => reject('One of two things went wrong...\n1) You provided an invalid emoji!\n\n2) I can not add reactions! Please give me permissions to do so.\nPermission: `Add Reactions`'));

                removedEmoji = reactions[guildId][group]['roles'][role.id]['emoji']
                emojiReactions = await message.reactions.resolve(removedEmoji);
                emojiReactions.remove().catch(e => reject('I can not remove reactions! Please give me permissions to do so.\nPermission: `Manage Messages`'))
            }

            reactions[guildId][group]['roles'][role.id][placeholder] = value;

            groupRoles = reactions[guildId][group]['roles'];
            groupRoles = Object.entries(groupRoles).map(([key, value]) => {
                return '\n\n' + value['emoji'] + ' - ' + value['name']
            });
            groupRoles = groupRoles.join('');

            const embeds = []
            embeds.push(new EmbedBuilder()
                .setTitle(reactions[guildId][group]['title'])
                .setDescription(((reactions[guildId][group]['limit'] > 0) ? '*You can only select ' + reactions[guildId][group]['limit'] + ' role(s)*\n' : '')
                    + reactions[guildId][group]['description']
                    + groupRoles ));

            await message.edit({ embeds });
            
            resolve('The `' + placeholder + '` of role `' + role.name + '` (in group `' + group + '`) is now ' + value);
        }
    })
}

module.exports.deleteRole = (guildId, group, role, confirm) => {
    return new Promise(async (resolve, reject) => {
        if (reactions[guildId] == null || reactions[guildId][group] == null) return reject('Group does not exist!');
        else if (reactions[guildId][group]['roles'] == null || reactions[guildId][group]['roles'][role.id] == null) return reject('Role does not exist!');
        if (!confirm) return reject('If you want to delete role `' + reactions[guildId][group]['roles'][role.id]['name'] + '` from group `' + group + '`, make sure you confirm the deletion!')

        const channelId = reactions[guildId][group]['channel'];
        const messageId = reactions[guildId][group]['message'];

        const guild = await bot.getClient().guilds.fetch(guildId).catch(e => reject(e.message));
        const channel = await guild.channels.fetch(channelId).catch(e => reject(e.message));
        const message = await channel.messages.fetch(messageId).catch(e => reject(e.message));

        removedEmoji = reactions[guildId][group]['roles'][role.id]['emoji']
        emojiReactions = await message.reactions.resolve(removedEmoji);
        emojiReactions.remove().catch(e => reject('I can not remove reactions! Please give me permissions to do so.\nPermission: `Manage Messages`'))
        delete reactions[guildId][group]['roles'][role.id]

        groupRoles = reactions[guildId][group]['roles'];
        groupRoles = Object.entries(groupRoles).map(([key, value]) => {
            return '\n\n' + value['emoji'] + ' - ' + value['name']
        });
        groupRoles = groupRoles.join('');

        const embeds = []
        embeds.push(new EmbedBuilder()
                .setTitle(reactions[guildId][group]['title'])
                .setDescription(((reactions[guildId][group]['limit'] > 0) ? '*You can only select ' + reactions[guildId][group]['limit'] + ' role(s)*\n' : '')
                    + reactions[guildId][group]['description']
                    + groupRoles ));

        await message.edit({ embeds });

        resolve('Deleted role `' + role.name + '` (in group `' + group + '`)');
    });
}

//
// Get Reactions
//
module.exports.getReactions = () => {
    return reactions;
}

module.exports.removeGuild = (guildId) => {
    delete reactions[guildId];
}