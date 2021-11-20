const fs = require('fs');
const { Client, Intents, WebhookClient, Collection,MessageActionRow,MessageButton,MessageEmbed, MessageCollector } = require('discord.js');
import * as tf from '@tensorflow/tfjs-node'

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

// Tensorflow
const model = tf.loadLayersModel('src/toxic_gauge/model/toxic_gauge/model/model.json')
console.log(model.summary())

let messageCollection = []
let instrucTion = ["you're doing great", "it's okay", "let's enjoy the game"]
let badFilter=[]
let warNingdisplay=['SECONDARY','SUCCESS','DANGER','DANGER','DANGER','DANGER','DANGER','DANGER','DANGER','DANGER','DANGER','DANGER',]
let i=0

discordClient.on("ready", () => {
  console.log(`logged in as ${discordClient.user.tag}!`)
})

discordClient.on("messageCreate", msg => {
  if (msg.author.bot) return
  console.log("Message coming")

  const messageObject = {
    body: msg.content,
    id: messageCollection.length +1,
    score: [
      Math.floor(Math.random()*2),Math.floor(Math.random()*2),
      Math.floor(Math.random()*2),Math.floor(Math.random()*2),
      Math.floor(Math.random()*2),Math.floor(Math.random()*2)
    ],
    toxicity: false     
  }
  if (messageObject.score.includes(1)){
    i+=1
    messageObject.toxicity = true
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setURL(msg.url)
        .setLabel('Go to message')
        .setStyle('LINK')
      )
    msg.react("🚨");
    msg.author.send({
      content: "One of your messages seems to have an appropriate word. Let's fix it shall we?", 
      components: [row]
    })
    //msg.reply({ content: "you're having bad behaviour, please use these suggestion below. You can proceed to continue but your BAD BEHAVIOUR- COUNT will increase by 1", ephemeral: true, components: [row] });
  }

  messageCollection = messageCollection
    .concat(messageObject)
    
  badFilter = messageCollection.filter(message => message.toxicity == true)
  console.log(JSON.stringify(badFilter))
  console.log(badFilter.length)

  messageCollection.forEach(message => {
    console.log(message.body, message.id, message.score, message.toxicity)
    
  })
})

discordClient.on('messageReactionAdd', async reaction => {
  if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
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

	if (interaction.isButton()) {
    if (interaction.customId === 'instruction1') {
      await interaction.reply({content:instrucTion[0]})
    }
    if (interaction.customId === 'instruction2') {
      await interaction.reply({content: instrucTion[1]})
    }
    if (interaction.customId === 'instruction3') {
      await interaction.reply({content: instrucTion[2]})
    }
    if (interaction.customId === 'originContent') {
      await interaction.reply({content: messageCollection[messageCollection.length-1].body })
    }
  }
});

discordClient.login(process.env['TOKEN']);