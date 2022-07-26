const { SlashCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, showModal } = require('discord-modals'); // Import all
const discordModals = require('discord-modals'); // Define the discord-modals package!

module.exports = {
    client: true,
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll')
        .addNumberOption((option) =>
            option
            .setName('options')
            .setDescription('How many options should the poll have?')
            .setRequired(true)
            .setMaxValue(5)
            .setMinValue(2)
        )
        .addStringOption((option) =>
            option
            .setName('question')
            .setDescription("What's the question?")
            .setRequired(true)
        )
        .addNumberOption((option) =>
            option.setName('time').setDescription('How long should the poll last?')
        ),
    async execute(interaction, client) {
        discordModals(client);

        const modal = new Modal() // We create a Modal
            .setCustomId('modal-customid')
            .setTitle('Modal');

        const options = interaction.options.getNumber('options');

        for (let i = 1; i >= options; i++) {
            modal.addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('option' + i)
                .setLabel('Option ' + i)
                .setStyle('SHORT') // IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setPlaceholder('Option ' + i)
                .setRequired(true) // If it's required or not
            );
        }

        showModal(modal, {
            client: client, // Client to show the Modal through the Discord API.
            interaction: interaction, // Show the modal with interaction data.
        });
    },
};