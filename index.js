const { Client, Intents } = require('discord.js')
const { MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require('discord.js')
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES
]})

let messageCollection = []
let badWord = ['fuck', 'gay']
let badFilter=[]

client.on("ready", () => {
  console.log(`logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
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
					.setStyle('PRIMARY'),
			);

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

client.login(process.env['TOKEN'])