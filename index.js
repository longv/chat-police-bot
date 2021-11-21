require('dotenv').config()
const fs = require('fs');
const axios = require('axios');
const { 
  Client, 
  Intents, 
  WebhookClient, 
  Collection,
  MessageActionRow,
  MessageButton,
} = require('discord.js');
const Database = require("@replit/database")

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

// Initialize database
const db = new Database(process.env["REPLIT_DATABASE_URL"]);

// Initialize hate labels
const hateLabels = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"]

discordClient.on("ready", async () => {
  console.log(`logged in as ${discordClient.user.tag}!`)
})

discordClient.on("messageCreate", async msg => {
  if (msg.author.bot) return

  console.log("Message coming")

  const response = await axios.get(`http://192.168.86.154:8000/predict?sentence=${msg.content}`)
  const scores = response.data
  console.log(scores)

  const violations = hateLabels.filter(label => scores[label] > 0.5)
    .map(label => label.replace('_', ' '));
  console.log(violations)

  if (violations.length > 0){
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setURL(msg.url)
        .setLabel('Go to message')
        .setStyle('LINK')
      )

    let warning = await db.get("warning")
    if (!warning) {
      warning = {}
    }
    const markedMessageIds = warning[msg.author.id] ?? []
    if (markedMessageIds.length < 3) {
      markedMessageIds.push(msg.id)
      warning[msg.author.id] = markedMessageIds
      await db.set("warning", warning)
    }
    console.log(warning)

    msg.react("🚨");
    if (markedMessageIds.length < 3) {
      msg.author.send({
        content: `One of your messages seems to contain hate speech _**${violations.join(', ')}**_.\nLet's fix it shall we?`, 
        components: [row]
      })
    } else {
      const guildManager = await discordClient.guilds.fetch(process.env['GUILD_ID'])
      const roles = await guildManager.roles.fetch()
      const mutedRole = roles.find(role => role.id == [process.env['MUTED_ROLE_ID']])
      msg.member.roles.add(mutedRole)
      msg.author.send({
        content: `You has been muted due to sending hate speech multiple times.\nLast message seems to contain _**${violations.join(', ')}**_`,
        components: [row]
      })
    }
  }
})

discordClient.on("messageUpdate", async (oldMsg, newMsg) => {
  console.log("Message update")
  console.log(newMsg.author.id)
  const warning = await db.get("warning")
  if (warning) {
    let markedMessageIds = warning[newMsg.author.id] ?? []
    markedMessageIds = markedMessageIds.filter(id => id !== newMsg.id)
    warning[newMsg.author.id] = markedMessageIds
    await db.set("warning", warning)
    console.log(warning)
  }
})

discordClient.on("messageDelete", async msg => {
  console.log("Message delete")
  console.log(msg.id)
  const warning = await db.get("warning")
  if (warning) {
    Object.keys(warning).forEach(async authorId => {
      let markedMessageIds = warning[authorId] ?? []
      if (markedMessageIds.includes(msg.id)) {
        markedMessageIds = markedMessageIds.filter(id => id !== msg.id)
        warning[authorId] = markedMessageIds
        await db.set("warning", warning)
        console.log(warning)
        return
      }
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