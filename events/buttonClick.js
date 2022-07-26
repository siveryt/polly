const { InteractionType } = require('discord.js');
const { createClient } = require('redis');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.type !== InteractionType.MessageComponent) return;

        const redis = createClient();
        redis.on('error', (err) => console.log('Redis Client Error', err));
        await redis.connect();

        const id = interaction.customId.slice(0, 36);
        const voted = interaction.customId.slice(43);

        if ((await redis.get(`${id}-votes`)) == null) {
            let content = interaction.message.content;
            let lines = content.split('\n');
            content = '';
            for (let i = 0; i < lines.length - 2; i++) {
                content += lines[i] + '\n';
            }
            content += `*This poll has ended <t:${Math.floor(
        new Date().getTime() / 1000
      )}:f>*`;
            interaction.update({ content: content, components: [] });
            return;
        }

        const multipleAnswers =
            (await redis.get(`${id}-multipleAnswers`)) == 'true';

        const participantsRedis = JSON.parse(await redis.get(`${id}-participants`));

        if (multipleAnswers) {
            if (participantsRedis[voted - 1].includes(interaction.member.id)) {
                interaction.member.send(`You have already voted for this poll!`);
                interaction.update(interaction.message.content);
                return;
            }

            console.log('multiple answers');
            participantsRedis[voted - 1].push(interaction.member.id);
        } else {
            if (participantsRedis.includes(interaction.member.id)) {
                interaction.member.send(`You have already voted for this poll!`);
                interaction.update(interaction.message.content);
                return;
            }
            participantsRedis.push(interaction.member.id);
        }

        const votes = JSON.parse(await redis.get(`${id}-votes`));
        const question = await redis.get(`${id}-question`);
        const options = JSON.parse(await redis.get(`${id}-options`));
        votes[voted - 1] = votes[voted - 1] + 1;
        const exp = await redis.ttl(`${id}-votes`);
        await redis.set(`${id}-votes`, JSON.stringify(votes));
        await redis.expire(`${id}-votes`, exp);

        await redis.set(`${id}-participants`, JSON.stringify(participantsRedis));
        await redis.expire(`${id}-participants`, exp);

        let participants = 0;

        for (let i = 0; i < votes.length; i++) {
            participants += votes[i];
        }
        // Creating Reply
        let reply = `**${question}**\n\n`;

        for (let i = 0; i < options.length; i++) {
            reply += `${options[i]}: |`;
            const square = Math.floor((votes[i] / participants) * 10);
            for (let j = 0; j < square; j++) {
                reply += '█';
            }
            const spaces = 10 - square;
            for (let j = 0; j < spaces; j++) {
                reply += '▁'; //░
            }
            reply += `| `;
            const percentage = Math.floor((votes[i] / participants) * 100);
            const votesForThis = votes[i];
            reply += `${percentage}% (${votesForThis} Votes)\n`;
        }
        reply += `*Participants:* ${participants}\n`;

        const expire = Math.floor(new Date().getTime() / 1000) + exp;
        reply += `\nPoll will close **<t:${expire}:R>**`;
        reply += `\nClick on the corresponding button to vote!`;

        interaction.update({
            content: `${reply}`,
        });
    },
};