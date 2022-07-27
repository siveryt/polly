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
        )
        .addBooleanOption((option) =>
            option
            .setName('multipleanswers')
            .setDescription('Should multiple answers be allowed?')
        ),
    async execute(interaction, client) {
        // Check if command was send in guild
        if (!interaction.inGuild())
            return interaction.reply('This command can only be used in a server.');

        // REDIS is using default port 6379 and hostname localhost with default options. Just to keep it simple
        const redis = createClient();
        redis.on('error', (err) => console.log('Redis Client Error', err));
        await redis.connect();

        // Generate UUID used for the poll
        const id = randomUUID();
        console.log(id);

        // Get argurments from command
        const options = interaction.options.getNumber('options');
        const question = interaction.options.getString('question');
        const time =
            interaction.options.getNumber('time') === null ?
            60 :
            interaction.options.getNumber('time');
        const multipleAnswers =
            interaction.options.getBoolean('multipleanswers') === null ?
            false :
            interaction.options.getBoolean('multipleanswers');

        // Save arguments to redis
        await redis.set(`${id}-options`, options);
        redis.expire(`${id}-options`, 5 * 60);
        await redis.set(`${id}-question`, question);
        redis.expire(`${id}-question`, 5 * 60);
        await redis.set(`${id}-expire`, time);
        redis.expire(`${id}-expire`, 5 * 60);
        await redis.set(`${id}-multipleAnswers`, multipleAnswers.toString());
        redis.expire(`${id}-multipleAnswers`, 5 * 60);

        // Initialize modal
        const modal = new ModalBuilder() // We create a Modal
            .setCustomId(`pollmodal-${id}`) // We set the custom id
            .setTitle('Options');

        // Create input for every option
        for (let i = 1; i < options + 1; i++) {
            const component = new TextInputBuilder()
                .setCustomId('option' + i)
                .setLabel('Option ' + i)
                .setStyle(TextInputStyle.Short) // IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setPlaceholder('Option ' + i)
                .setRequired(true); // If it's required or not

            // Add input to modal
            const actionRow = new ActionRowBuilder().addComponents(component);
            modal.addComponents(actionRow);
        }

        // Send Modal to user
        await interaction.showModal(modal, {
            client: client, // Client to show the Modal through the Discord API.
            interaction: interaction, // Show the modal with interaction data.
        });
    },
};