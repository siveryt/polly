// NOTE: Probably doesn't work on DJS 14; will be fixed soon

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
        console.log('executed');
        if (interaction.type !== InteractionType.ModalSubmit) return;
        if (!interaction.customId.startsWith('pollmodal-')) return;

        const redis = createClient();
        redis.on('error', (err) => console.log('Redis Client Error', err));
        redis.connect();

        const id = interaction.customId.slice(10);

        console.log(id);

        // if ((await redis.get(`${id}-handled`)) !== null) return;
        // console.log(await redis.get(`${id}-handled`));
        // redis.set(`${id}-handled`, 'true');

        const time = await redis.get(`${id}-expire`);
        const question = await redis.get(`${id}-question`);
        const optionCount = await redis.get(`${id}-options`);
        const expire = time * 60 + Math.floor(new Date().getTime() / 1000);
        await redis.del(`${id}-expire`);
        redis.expire(`${id}-question`, time * 60);

        for (let i = 0; i < optionCount; i++) {
            if (interaction.fields.getTextInputValue(`option${i + 1}`).length > 80) {
                redis.del(`${id}-question`);
                redis.del(`${id}-options`);

                interaction.reply(
                    `Option ${i + 1} too long! Maximal **80** characters.`
                );
                return;
            }
        }

        // Saving options to redis
        const votes = [];
        const options = [];
        for (let i = 0; i < optionCount; i++) {
            options.push(interaction.fields.getTextInputValue(`option${i + 1}`));
            votes.push(0);
        }
        redis.set(`${id}-votes`, JSON.stringify(votes));
        redis.expire(`${id}-votes`, time * 60);
        redis.set(`${id}-options`, JSON.stringify(options));
        redis.expire(`${id}-options`, time * 60);
        const participants = [];
        if ((await redis.get(`${id}-multipleAnswers`)) == 'true') {
            for (let i = 0; i < optionCount; i++) {
                participants.push([]);
            }
        }
        redis.set(`${id}-participants`, JSON.stringify(participants));
        redis.expire(`${id}-participants`, time * 60);

        // Creating Reply
        let reply = `**${question}**\n\n`;

        for (let i = 0; i < options.length; i++) {
            reply += `${options[i]}: |▁▁▁▁▁▁▁▁▁▁| 0% (0 Votes)\n`;
        }
        reply += `*Participants:* 0\n`;

        reply += `\nPoll will close **<t:${expire}:R>**`;
        reply += `\nClick on the corresponding button to vote!`;

        // Creating Buttons
        const row = new ActionRowBuilder();

        console.log(await redis.get(`${id}-options`));

        for (let i = 0; i < optionCount; i++) {
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`${id}-option${i + 1}`)
                .setLabel(interaction.fields.getTextInputValue(`option${i + 1}`))
                .setStyle(ButtonStyle.Primary)
            );
        }

        await interaction.reply({ content: reply, components: [row] });
    },
};