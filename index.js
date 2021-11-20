const fs = require('fs');
const axios = require('axios');
const { 
  Client, 
  Intents, 
  WebhookClient, 
  Collection,
  MessageActionRow,
  MessageButton
} = require('discord.js');
const { data } = require('./commands/all');

// Initialize discord client
const discordClient = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
// Initialize commands used by discord server
discordClient.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	discordClient.commands.set(command.data.name, command);
}

// Initialize the web hook to send message as a user
const captainHook = new WebhookClient({
  id: process.env['CAPTAIN_HOOK_ID'],
  token: process.env['CAPTAIN_HOOK_TOKEN']
})

// Initialze tokenizer to provide data to model
const tokenizerRaw = fs.readFileSync('tokenizer.json')
const tokenizer = JSON.parse(tokenizerRaw)

discordClient.on("ready", () => {
  console.log(`logged in as ${discordClient.user.tag}!`)
})

discordClient.on("messageCreate", async message => {
  if (msg.author.bot) return

  console.log("Message coming")

  const dataSet = message.content.trim().split(/\s+/).map(word => {
    const token = tokenizer[word];
    if (token) {
      return token;
    } else {
      return 0;
    }
  })

  try {
    const score = await axios.post('', [dataSet])
  } catch (error) {
    console.error('Something went wrong when sending data to model:', error);
    return;
  }

  if (false) {
    message.react("🚨");
    message.author.send({
      content: "One of your messages seems to have an appropriate word. Let's fix it shall we?", 
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
          .setURL(msg.url)
          .setLabel('Go to message')
          .setStyle('LINK')
        )
      ]
    })
  }
})

discordClient.on('messageReactionAdd', async reaction => {
  if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}

  const isMarked = reaction.users.cache.some(user => user.id === discordClient.user.id);
  if (isMarked) {
    const guildManager = await discordClient.guilds.fetch(process.env['GUILD_ID'])
    const totalUserCount = guildManager.memberCount - 3
    const reactedUserCount = reaction.count - 1;
    const reactedRatio = reactedUserCount / totalUserCount;
    if (reactedRatio >= 0.5) {
      reaction.message.delete();
    }
  }
})

discordClient.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = discordClient.commands.get(interaction.commandName);

    if (!command) return;
  
    try {
      await command.execute(captainHook, interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

discordClient.login(process.env['TOKEN']);