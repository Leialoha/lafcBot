const { PermissionFlagsBits } = require("discord.js");
const reactions = require('../../utils/reactions.js');

module.exports = {
	execute(client, guildId) {
        const command = {
            name: "reaction",
            description: "The base command for role menus",
            default_member_permissions: (PermissionFlagsBits.ManageChannels) + '',
            options: [
                {
                    name: "group",
                    description: "Modify a role group",
                    type: 2,
                    options: [
                        {
                            name: "create",
                            description: "Create a group",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The new group name",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "channel",
                                    description: "The channel of the group",
                                    type: 7, // 7 is type CHANNEL
                                    required: true
                                }
                            ]
                        },
                        {
                            name: "list",
                            description: "List all groups",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "Filter a group",
                                    type: 3, // 3 is type STRING
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "channel",
                            description: "Get or change the group's channel",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "channel",
                                    description: "The new channel",
                                    type: 7, // 7 is type CHANNEL
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "description",
                            description: "Get or change the group's description",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "description",
                                    description: "The new description",
                                    type: 3, // 3 is type STRING
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "title",
                            description: "Get or change the group's title",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "title",
                                    description: "The new title",
                                    type: 3, // 3 is type STRING
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "limit",
                            description: "Get or change the group's limit",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "limit",
                                    description: "The new limit (Set to 0 for no limit)",
                                    type: 10, // 10 is type INTEGER
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "delete",
                            description: "Delete a group",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to delete",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "confirm",
                                    description: "Are you sure?",
                                    type: 5, // 5 is type BOOLEAN
                                    required: true
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "role",
                    description: "Modify a role",
                    type: 2,
                    options: [
                        {
                            name: "create",
                            description: "Create a role",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "role",
                                    description: "The role to create",
                                    type: 8, // 8 is type ROLE
                                    required: true
                                },
                                {
                                    name: "emoji",
                                    description: "The new emoji",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "name",
                                    description: "The new name",
                                    type: 3, // 3 is type STRING
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "list",
                            description: "List all roles",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "Filter a group",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "role",
                                    description: "Filter a role",
                                    type: 8, // 8 is type ROLE
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "emoji",
                            description: "Get or change a role's emoji",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "role",
                                    description: "The role to modify",
                                    type: 8, // 8 is type ROLE
                                    required: true
                                },
                                {
                                    name: "emoji",
                                    description: "The new emoji",
                                    type: 3, // 3 is type STRING
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "name",
                            description: "Get or change a role's name",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "role",
                                    description: "The role to modify",
                                    type: 8, // 8 is type ROLE
                                    required: true
                                },
                                {
                                    name: "name",
                                    description: "The new name",
                                    type: 3, // 3 is type STRING
                                    required: false
                                }
                            ]
                        },
                        {
                            name: "delete",
                            description: "Delete a role",
                            type: 1,
                            options: [
                                {
                                    name: "group",
                                    description: "The group to modify",
                                    type: 3, // 3 is type STRING
                                    required: true
                                },
                                {
                                    name: "role",
                                    description: "The role to delete",
                                    type: 8, // 8 is type ROLE
                                    required: true
                                },
                                {
                                    name: "confirm",
                                    description: "Are you sure?",
                                    type: 5, // 5 is type BOOLEAN
                                    required: true
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        return command;
	},

    load: (client) => {

        roleReactions = reactions.getReactions();
        guildIds = Object.keys(roleReactions);

        guildIds.forEach(async (guildId) => {
            try {
                const guild = await client.guilds.fetch(guildId);
                const groups = Object.keys(roleReactions[guildId]);
                
                await groups.forEach(async (group) => {
                    const groupReactions = roleReactions[guildId][group];
                    
                    const channel = await guild.channels.fetch(groupReactions['channel']);
                    const message = await channel.messages.fetch(groupReactions['message']);

                    // await reactions.modifyGroup(guildId, group, 'channel', ['channel']);
                });
            } catch (ignored) {}
        });
    },

    run: async (interaction) => {
        var options = interaction.options;

        var subCommand = options.getSubcommand();
        var subCommandGroup = options.getSubcommandGroup();

        var group = options.getString('group');
        var role = options.getRole('role');

        var channel = options.getChannel('channel');
        var title = options.getString('title');
        var description = options.getString('description');
        description = (description != null) ? description.replaceAll('\\n', '\n') : null;
        var limit = options.getNumber('limit');

        var emoji = options.getString('emoji');
        emoji = (emoji != null) ? emoji.trim() : null;
        var name = options.getString('name');

        var confirm = options.getBoolean('confirm');

        var value = null;

        try {
            if (subCommandGroup == 'group') {
                switch (subCommand) {
                    case 'create':
                        if (!channel.isTextBased()) {
                            interaction.reply({ content: '<#' + channel + '> is not a text channel!\nPlease submit a text channel.', ephemeral: true });
                            break;
                        }

                        promise = reactions.createGroup(interaction.guild.id, group, channel.id);
                        promise.then((content) => interaction.reply({ content , ephemeral: false })).catch((content) => interaction.reply({ content , ephemeral: false }));
                        break;
                    case 'list':
                        reactions.listGroups(interaction.guild.id, group);
                        break;
                    case 'channel':
                        if (channel != null && !channel.isTextBased()) {
                            interaction.reply({ content: '<#' + channel + '> is not a text channel!\nPlease submit a text channel.', ephemeral: true });
                            break;
                        }
                        value = (channel == null) ? null : channel.id;
                    case 'description':
                        value = (value == null) ? description : value;
                    case 'title':
                        value = (value == null) ? title : value;
                    case 'limit':
                        value = (value == null) ? limit : value;
                        promise = reactions.modifyGroup(interaction.guild.id, group, subCommand, value);
                        promise.then((content) => interaction.reply({ content , ephemeral: false })).catch((content) => interaction.reply({ content , ephemeral: true }));
                        break;    
                    case 'delete':
                        promise = reactions.deleteGroup(interaction.guild.id, group, confirm)
                        promise.then((content) => interaction.reply({ content , ephemeral: false })).catch((content) => interaction.reply({ content , ephemeral: true }));
                        break;
                }
            }

            if (subCommandGroup == 'role') {
                switch (subCommand) {
                    case 'create':
                        promise = reactions.createRole(interaction.guild.id, group, role, emoji, name);
                        promise.then((content) => interaction.reply({ content , ephemeral: false })).catch((content) => interaction.reply({ content , ephemeral: true }));
                        break;
                    case 'list':
                        break;
                    case 'emoji':
                        value = emoji
                    case 'name':
                        value = (value == null) ? name : value;
                        promise = reactions.modifyRole(interaction.guild.id, group, role, subCommand, value);
                        promise.then((content) => interaction.reply({ content , ephemeral: false })).catch((content) => interaction.reply({ content , ephemeral: true }));
                        break;
                    case 'delete':
                        promise = reactions.deleteRole(interaction.guild.id, group, role, confirm);
                        promise.then((content) => interaction.reply({ content , ephemeral: false })).catch((content) => interaction.reply({ content , ephemeral: true }));
                        break;
                }
            }
        } catch (e) {
            interaction.reply({ content: e.message, ephemeral: true });
        }
    },

    react: async (messageReaction, _user) => {
        const message = messageReaction.message;
        const channel = message.channel;
        const guild = channel.guild;

        const emoji = messageReaction.emoji.toString();

        if (guild == null) return;

        var roleReactions = reactions.getReactions();
        if (roleReactions[guild.id] == null) return;

        var guildReactions = Object.entries(roleReactions[guild.id]).filter(([key, value]) => value['channel'] == channel.id && value['message'] == message.id).map(([key, value]) => value);
        if (guildReactions.length == 0) return;

        var roleGroup = Object.entries(guildReactions[0]['roles']).filter(([key, value]) => value['emoji'] == emoji);
        var role = roleGroup.map(([key, value]) => key)[0];

        const roleList = Object.entries(guildReactions[0]['roles']).map(([key, value]) => key).filter((filterRole) => filterRole != role);

        const limit = guildReactions[0]['limit'];
        const limited = limit > 0;

        try {
            role = await guild.roles.fetch(role);
        } catch (e) {
            role = null;
        }

        var guildReactions = await messageReaction.fetch();

        try {
            await messageReaction.users.cache.forEach(async (user) => {
                if (user.id == messageReaction.client.user.id) return;

                messageReaction.users.remove(user)
                if (user.bot) return;
                if (role == null) return;

                try {
                    const member = await guild.members.fetch(user);

                    const checkRole = await member.roles.cache.filter(memberRole => memberRole.id == role.id);
                    const hasRole = checkRole.size == 1;
                    
                    const listOtherRoles = await member.roles.cache.filter(memberRole => roleList.includes(memberRole.id));

                    try {
                        if (hasRole) await member.roles.remove(role);
                        else if (!limited || listOtherRoles.size < limit) await member.roles.add(role);
                    } catch (e) {
                        channel.send('I can not change user roles! Please give me permissions to do so.\nPermission: `Manage Roles`')
                    };
                } catch (e) {
                    console.log(e)
                }
            });
        } catch (e) {
            channel.send('I can not remove reactions! Please give me permissions to do so.\nPermission: `Manage Messages`')
        }
    }
};