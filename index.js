const fs = require('fs');
const { Client, Intents, WebhookClient, Collection } = require('discord.js');

// Initialize discord client
const discordClient = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES
]});
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

let messageCollection = []
let badWord = ['fuck', 'gay']
let badFilter=[]

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
    messageObject.toxicity = true
      const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('send')
					.setLabel('send')
					.setStyle('PRIMARY')
          
			)


      const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('you are doing great')
      

			msg.reply({ content: 'please use these suggestions', ephemeral: true, embeds: [embed], components: [row] });
    

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
    if (interaction.customId === 'send') {
      await interaction.reply(interaction.title)
    }
  }
});

discordClient.login(process.env['TOKEN']);