const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES
]})

client.on("ready", () => {
  console.log(`logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
  console.log("Message coming")
  if(msg.content === "ping"){
    msg.reply("pong")
  }
})



client.login(process.env['TOKEN'])