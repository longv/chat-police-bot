const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('all')
		.setDescription('Chat to all players')
    .addStringOption(option =>
		  option.setName('input')
      .setDescription('Put your chat here')
			.setRequired(true)
    ),
	async execute(hook, interaction) {
    await hook.send({
			content: interaction.options.data[0].value,
			username: interaction.user.username,
			avatarURL: interaction.user.avatarURL()
		});
	},
};