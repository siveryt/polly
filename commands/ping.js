const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Poooooong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};