#!/usr/bin/env node

// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    InteractionType,
} = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});

// MARK: Commandhandler
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// Add actions to the commands
client.on('interactionCreate', async (interaction) => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        if (command.client) {
            await command.execute(interaction, client);
        } else {
            await command.execute(interaction);
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
});

// MARK: Eventhandler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    try {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    } catch (error) {
        console.error(error);
    }
}

// MARK: Login
client.login(token);