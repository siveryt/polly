# siveryt/polly 📊

> [!WARNING]  
> Polly has been DISCONTINUED due to Discord's new poll feature. You can still run the bot by yourself. If you want to do so, clone the repo and follow the instructions down below.  
> Unfortunately, polly uses redis as storage which as the time of developing polly wasn't that big of a controversy. Now it is. I'm not going to change the storage system to something else. If you want to run the bot, you have to install redis. :)  
> glhf :)  

> Polly is a Discord-Bot designed for a better experience with Polls

## Features

- Unlimited polls
- Multiple-answer polls
- Up to 5 options per poll
- Fast responses
- Time restricted polls
- Polls upto 1 day of runtime

## Usage

Invite Polly to your Discord-Server via [this link](http://polly.sivery.de/invite). Once Polly got invited, you're free to use `/poll` as a command. Everyone can use it to create their own polls.

You first have to enter how many options the poll is going to have. Then you enter how's your question going to be called. These two fields are required.
Optionally you can enable _multiple-answers_ so your participant can choose more than one option. If you want to you can also increase or decrease how long th epoll should last. Default is 60 (1h). An command can look like this:

`/poll options:2 question:Do you like polly?`

After you've executed your command, yo're greeted with a form where you fill in all your options. You have 5 minutes to enter in you options

![Discord modal with two TextFields (short)](assets/modal.png 'How your form is going to look like')

When you submit the form, the poll is going to be created:

![Discord message with poll](assets/poll.png 'How your poll is going to look like')

## How to run the bot

If you want to run Polly by yourself, you have to clone this repo and follow the instructions in `example-config.jsonc`:

```jsonc
{
  "clientId": "419828969588916225", // Client ID of the bot
  "token": "SUPERVERYVERYMEGASECRET" // Token of the bot
}

// NOTE: To user the config rename it in "config.json" and remove all the comments
```

You can get your token from the [Discord Developer Portal](https://discord.com/developers/). You can create a new application and make it into a bot. Then copy the token and paste it in.

I've got my client id from the Discord-app: I activated developer mode and copied the id from the bot with a right click.

### Node and NPM

Make sure that you have [Node.js v16.15.1](https://nodejs.org/) or above installed. Then run `npm install` to automatically download and install all needed packages for the bot to run.

### Deploy commands

In order to enable the command polly provides, you have to run `deploy-commands.js`. This file is going to register the commands to your bot. Run it with `node deploy-commands.js`.

### Run the bot

To run the bot, just type `node .` into your terminal. The bot is going to boot up within a fed seconds. If you close your terminal, the bot is also stopped.

## Create Service on Linux

If you want the bot to automatically start, when your machine boots up, you can create a service-file for systemd. An example is given in `polly.service`. Please don't forget to replace the placeholders with real values!

| Placeholder | Description                                        |
|-------------|----------------------------------------------------|
| PATHTOPOLLY | Path where you have downloaded and installed polly |
| USER        | User who executes the service                      |
| GROUP       | Group from user which executes the service         |

### Invite to server

You'll have to create a cutom link in order to invite the bot hostet by yourself. Just replace _CLIENTIDHERE_ with your client id and paste it into your browser.

`https://discord.com/api/oauth2/authorize?client_id=CLIENTIDHERE&permissions=274877909056&scope=bot%20applications.commands`

## Contribution

I'm happy to see other people working on polly! If you have a nice feature idea, feel free to fork the repo and submit a pull request, once you're done!

### Redis

I've used the basic Redis-Dockerimage to create a Redis-server. I guess this is also for you an option to get redis up and running. Because I'm on a closed network, I haven't added authentication and the bot will access redis on `localhost:6379`

I hope you like my little bot. Bye ❤️

<!-- Many Discord-Sevrer nowadays use Polls to interact with their community, but usually these endup in Messages and Readtions attached to them and no time limit. Polly solves this Issue with Button and Time-restricted polls.
The many options give you the opportunity to customize your polls to your needs -->
