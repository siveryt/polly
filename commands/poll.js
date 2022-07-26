const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');

const { createClient } = require('redis');
const { randomUUID } = require('crypto');

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
            option
            .setName('time')
            .setDescription('How long should the poll last in minutes?')
            .setMaxValue(10080)
            .setMinValue(1)
        ),
    async execute(interaction, client) {
        // discordModals(client);
        // REDIS is using default port 6379 and hostname localhost with default options. Just to keep it simple
        const redis = createClient();
        redis.on('error', (err) => console.log('Redis Client Error', err));
        await redis.connect();

        const id = randomUUID();
        console.log(id);

        const options = interaction.options.getNumber('options');
        const question = interaction.options.getString('question');
        const time =
            interaction.options.getNumber('time') === null ?
            60 :
            interaction.options.getNumber('time');

        await redis.set(`${id}-options`, options);
        await redis.set(`${id}-question`, question);
        await redis.set(`${id}-expire`, time);

        const modal = new ModalBuilder() // We create a Modal
            .setCustomId(`pollmodal-${id}`) // We set the custom id
            .setTitle('Options');

        for (let i = 1; i < options + 1; i++) {
            const component = new TextInputBuilder()
                .setCustomId('option' + i)
                .setLabel('Option ' + i)
                .setStyle(TextInputStyle.Short) // IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setPlaceholder('Option ' + i)
                .setRequired(true); // If it's required or not

            const actionRow = new ActionRowBuilder().addComponents(component);
            modal.addComponents(actionRow);
        }

        await interaction.showModal(modal, {
            client: client, // Client to show the Modal through the Discord API.
            interaction: interaction, // Show the modal with interaction data.
        });
    },
};