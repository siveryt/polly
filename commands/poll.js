const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    modal: true,
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll')
        .addNumberOption((option) =>
            option
            .setName('options')
            .setDescription('How many options should the poll have?')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};