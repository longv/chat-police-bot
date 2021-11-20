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

discordClient.on("ready", () => {
  console.log(`logged in as ${discordClient.user.tag}!`)
});

discordClient.on("messageCreate", async msg => {
  console.log("Message coming")
  if(msg.content === "ping"){
    msg.reply("pong")
  }
});

discordClient.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = discordClient.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(captainHook, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

discordClient.login(process.env['TOKEN']);