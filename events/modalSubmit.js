const {
    InteractionType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

const { createClient } = require('redis');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Check if event belongs to polly and is a ModalSubmit
        if (interaction.type !== InteractionType.ModalSubmit) return;
        if (!interaction.customId.startsWith('pollmodal-')) return;

        console.log('Modal Submitted');
        console.log(interaction);

        // REDIS is using default port 6379 and hostname localhost with default options. Just to keep it simple
        const redis = createClient();
        redis.on('error', (err) => console.log('Redis Client Error', err));
        redis.connect();

        // Get ID of poll from customId
        const id = interaction.customId.slice(10);

        // Check if poll already expired
        if ((await redis.get(`${id}-expire`)) == null) {
            interaction.reply({
                content: 'You were to slow entering your options!',
            });
            return;
        }

        // Get argurments from REDIS
        const time = await redis.get(`${id}-expire`);
        const question = await redis.get(`${id}-question`);
        const optionCount = await redis.get(`${id}-options`);
        const expire = time * 60 + Math.floor(new Date().getTime() / 1000);
        // remove expire time from redis (no longer needed)
        await redis.del(`${id}-expire`);
        // make all redis keys expire in when the poll is over
        redis.expire(`${id}-question`, time * 60);
        redis.expire(`${id}-options`, time * 60);
        redis.expire(`${id}-multipleAnswers`, time * 60);

        // Check if any of the options are longer than 80 characters
        for (let i = 0; i < optionCount; i++) {
            if (interaction.fields.getTextInputValue(`option${i + 1}`).length > 80) {
                redis.del(`${id}-question`);
                redis.del(`${id}-options`);
                redis.del(`${id}-multipleAnders`);

                interaction.reply(
                    `Option ${i + 1} too long! Maximal **80** characters.`
                );
                return;
            }
        }

        // ## Saving options to redis ##
        const votes = [];
        const options = [];
        // Fill arrays with options and votes
        for (let i = 0; i < optionCount; i++) {
            options.push(interaction.fields.getTextInputValue(`option${i + 1}`));
            votes.push(0);
        }
        // Save everything to redis and expire
        redis.set(`${id}-votes`, JSON.stringify(votes));
        redis.expire(`${id}-votes`, time * 60);
        redis.set(`${id}-options`, JSON.stringify(options));
        redis.expire(`${id}-options`, time * 60);

        // Create participants array
        const participants = [];
        // Check if array has to be 1D or 2D
        if ((await redis.get(`${id}-multipleAnswers`)) == 'true') {
            for (let i = 0; i < optionCount; i++) {
                participants.push([]);
            }
        }
        // Save to redis and expire
        redis.set(`${id}-participants`, JSON.stringify(participants));
        redis.expire(`${id}-participants`, time * 60);

        // Creating Reply
        let reply = `**${question}**\n\n`;

        // For every options create statusline
        for (let i = 0; i < options.length; i++) {
            reply += `${options[i]}: |▁▁▁▁▁▁▁▁▁▁| 0% (0 Votes)\n`;
        }
        // Participant count
        reply += `*Participants:* 0\n`;

        // Expire time
        reply += `\nPoll will close **<t:${expire}:R>**`;
        reply += `\nClick on the corresponding button to vote!`;

        // Creating Buttons
        const row = new ActionRowBuilder();

        // For every option create a button
        for (let i = 0; i < optionCount; i++) {
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`pollmodal-${id}-option${i + 1}`) // set it to pollmodal-ID-option1, pollmodal-ID-option2, pollmodal-ID-option3 etc.
                .setLabel(interaction.fields.getTextInputValue(`option${i + 1}`)) // set label to option
                .setStyle(ButtonStyle.Primary)
            );
        }

        // Send reply and buttons
        await interaction.reply({ content: reply, components: [row] });
    },
};