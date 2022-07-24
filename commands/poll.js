const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    Modal,
    TextInputComponent,
    SelectMenuComponent,
    showModal,
} = require('discord-modals'); // Import all
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
        ),
    async execute(interaction, client) {
        discordModals(client);

        const modal = new Modal() // We create a Modal
            .setCustomId('modal-customid')
            .setTitle('Modal')
            .addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('title')
                .setLabel('Title')
                .setStyle('SHORT') // IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setPlaceholder('How should the poll be called?')
                .setRequired(true), // If it's required or not

                new TextInputComponent() // We create a Text Input Component
                .setCustomId('description')
                .setLabel('Description')
                .setStyle('LONG') // IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setPlaceholder('Descripe your poll')
                .setRequired(false), // If it's required or not

                new SelectMenuComponent() // We create a Select Menu Component
                .setCustomId('expire')
                .setPlaceholder('When should the poll expire?')
                .addOptions({
                    label: '1m',
                    value: '1',
                }, {
                    label: '2m',
                    value: '2',
                }, {
                    label: '3m',
                    value: '3',
                }, {
                    label: '5m',
                    value: '5',
                }, {
                    label: '10m',
                    value: '10',
                }, {
                    label: '30m',
                    value: '30',
                }, {
                    label: '1h',
                    value: '60',
                }, {
                    label: '2h',
                    value: '120',
                }, {
                    label: '5h',
                    value: '300',
                }, {
                    label: '12h',
                    value: '720',
                }, {
                    label: '1d',
                    value: '1440',
                }, {
                    label: '2d',
                    value: '2880',
                }, {
                    label: '7d',
                    value: '10080',
                })
            );

        const options = interaction.options.getNumber('options');

        for (let i = 0; i < options; i++) {
            console.log('Adding option ' + i);
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