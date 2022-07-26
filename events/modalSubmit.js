const { UnsafeTextInputBuilder } = require('@discordjs/builders');
const { createClient } = require('redis');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        console.log('executed');
        if (interaction.type !== 'MODAL_SUBMIT') return;
        if (!interaction.customId.startsWith('pollmodal-')) return;

        const redis = createClient();
        redis.on('error', (err) => console.log('Redis Client Error', err));
        redis.connect();

        const id = interaction.customId.slice(10);

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

        const options = [];
        for (let i = 0; i < optionCount; i++) {
            options.push(interaction.fields.getTextInputValue(`option${i + 1}`));
        }

        redis.set(`${id}-options`, JSON.stringify(options));
        redis.expire(`${id}-options`, time * 60);

        let reply = `**${question}**\n`;

        for (let i = 0; i < options.length; i++) {
            reply += `${options[i]}: |░░░░░░░░░░| 0%\n`;
        }

        reply += `\nPoll will close **<t:${expire}:R>**`;
        reply += `\nClick on the corresponding button to vote!`;

        await interaction.reply(reply);

        // redis.set(`${id}-options`, JSON.stringify(options));
    },
};