const { InteractionType } = require('discord.js');
const { createClient } = require('redis');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Check if event belongs to polly and is a MessageComponent
        if (interaction.type !== InteractionType.MessageComponent) return;
        if (!interaction.customId.startsWith('pollmodal-')) return;

        // REDIS is using default port 6379 and hostname localhost with default options. Just to keep it simple
        const redis = createClient();
        redis.on('error', (err) => console.log('Redis Client Error', err));
        await redis.connect();

        // Get ID of poll from customId
        const id = interaction.customId.slice(10, 46);
        // Get what button was pressed
        const voted = interaction.customId.slice(53);
        debugger;

        // Check if poll already expired
        if ((await redis.get(`${id}-votes`)) == null) {
            // Get content of message
            let content = interaction.message.content;
            // Split them up and remove last 2 lines
            let lines = content.split('\n');
            content = '';
            for (let i = 0; i < lines.length - 2; i++) {
                content += lines[i] + '\n';
            }
            // Append "Voting has ended" to message
            content += `*This poll has ended <t:${Math.floor(
        new Date().getTime() / 1000
      )}:f>*`;
            // Set content of message
            interaction.update({ content: content, components: [] });
            // return function
            return;
        }

        // get data from redis
        const multipleAnswers =
            (await redis.get(`${id}-multipleAnswers`)) == 'true';

        const participantsRedis = JSON.parse(await redis.get(`${id}-participants`));

        // Check if multiple answers are allowed
        if (multipleAnswers) {
            // Check if user already voted
            if (participantsRedis[voted - 1].includes(interaction.member.id)) {
                interaction.member.send(`You have already voted for this poll!`);
                interaction.update(interaction.message.content);
                return;
            }

            // Add user to list of voted users
            participantsRedis[voted - 1].push(interaction.member.id);
        } else {
            // Check if user already voted
            if (participantsRedis.includes(interaction.member.id)) {
                interaction.member.send(`You have already voted for this poll!`);
                interaction.update(interaction.message.content);
                return;
            }
            // Add user to list of voted users
            participantsRedis.push(interaction.member.id);
        }

        // Get more data from redis
        const votes = JSON.parse(await redis.get(`${id}-votes`));
        const question = await redis.get(`${id}-question`);
        const options = JSON.parse(await redis.get(`${id}-options`));
        // set new data for votes to redis and expire
        votes[voted - 1] = votes[voted - 1] + 1;
        const exp = await redis.ttl(`${id}-votes`);
        await redis.set(`${id}-votes`, JSON.stringify(votes));
        await redis.expire(`${id}-votes`, exp);
        // set new data for participants to redis and expire
        await redis.set(`${id}-participants`, JSON.stringify(participantsRedis));
        await redis.expire(`${id}-participants`, exp);

        // Count participants
        let participants = 0;
        for (let i = 0; i < votes.length; i++) {
            participants += votes[i];
        }

        // Creating Reply
        let reply = `**${question}**\n\n`;

        // Create/calculate statusline for every option
        for (let i = 0; i < options.length; i++) {
            reply += `${options[i]}: |`;
            // Add Black squares
            const square = Math.floor((votes[i] / participants) * 10);
            for (let j = 0; j < square; j++) {
                reply += '█';
            }
            // Add underlines
            const spaces = 10 - square;
            for (let j = 0; j < spaces; j++) {
                reply += '▁'; // alternative: ░
            }
            reply += `| `;
            // Add percentage
            const percentage = Math.floor((votes[i] / participants) * 100);
            const votesForThis = votes[i];
            reply += `${percentage}% (${votesForThis} Votes)\n`;
        }
        // Add Participants to reply
        reply += `*Participants:* ${participants}\n`;

        // Calculate when poll will end
        const expire = Math.floor(new Date().getTime() / 1000) + exp;
        reply += `\nPoll will close **<t:${expire}:R>**`;
        reply += `\nClick on the corresponding button to vote!`;

        // Update message
        interaction.update({
            content: `${reply}`,
        });
    },
};