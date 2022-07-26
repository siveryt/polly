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
        redis.set(`${id}-expire`, expire);

        console.log(interaction);

        const options = [];
        for (let i = 0; i < optionCount; i++) {
            options.push(interaction.fields.getTextInputValue(`option${i + 1}`));
        }

        let reply = `**${question}**\n`;

        for (let i = 0; i < options.length; i++) {
            reply += `**${i + 1}.** ${options[i]}: |░░░░░░░░░░| 0%\n`;
        }

        await interaction.reply(reply);

        // redis.set(`${id}-options`, JSON.stringify(options));
    },
};