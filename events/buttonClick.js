const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        if (interaction.type !== InteractionType.MessageComponent) return;

        interaction.update({
            content: 'Hello World!',
        });
    },
};