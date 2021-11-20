const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES
]})


const MessageCollection =[]


client.on("ready", () => {
  console.log(`logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
  console.log("Message coming")

const messageObject = {
    body: msg.content,
    id: MessageCollection.length +1,
    score: [Math.floor(Math.random()*1),Math.floor(Math.random()*1),
      Math.floor(Math.random()*1),Math.floor(Math.random()*1),
      Math.floor(Math.random()*1),Math.floor(Math.random()*1)],
    toxicity: false
      
    }
    
    MessageCollection.concat(messageObject)
    setMessagetoxicity(MessageCollection)
  MessageCollection.map(message => {
    console.log(message.body, message.id, message.score, message.toxicity)
  })
})

const setMessagetoxicity = (mesSage) => {
  mesSage.map(message => {
    if (message.score.includes(1))
    message.toxicity = true;
  })
}






client.login(process.env['TOKEN'])