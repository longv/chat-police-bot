const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES
]})

let messageCollection = []
let i=0
let badFilter=[]

client.on("ready", () => {
  console.log(`logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
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
    
  console.log(JSON.stringify(messageObject))

  messageCollection = messageCollection
    .concat(messageObject)
    .map(message => {
      if (message.score.includes(1)) {
        return { ...message, toxicity: true }
      } else {
        return message
      }
    })
  badFilter = messageCollection.filter(message => message.toxicity == true)
  console.log(JSON.stringify(badFilter))
  console.log(badFilter.length)


  console.log(JSON.stringify(messageCollection))

  messageCollection.forEach(message => {
    console.log(message.body, message.id, message.score, message.toxicity)
    
  })
})

client.login(process.env['TOKEN'])