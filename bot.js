const Discord = require('discord.js');
const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { TOKEN } = require('./token');


const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.MessageContent
  ]
});

const prefix = '!';

const { DisTube } = require('distube');

client.distube = new DisTube(client, {
  leaveOnStop: false,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
});

client.on('ready', () => {
  console.log(`Bot olarak giriş yapıldı: ${client.user.tag}`);

});


(async () => {
  const rest = new REST({ version: '9' }).setToken(TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands('1111038389433671800  ', '1054780326402064504'),
      { body: [
        new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'), 
        //new SlashCommandBuilder().setName('play').setDescription('Plays a song from YouTube').addStringOption(option => option.setName('song').setDescription('The song to play').setRequired(true)),
      ]},
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
}})();


(async () => {
  const rest = new REST({ version: '9' }).setToken(TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands('1111038389433671800  ', '373428306634342400'),
      { body: [
        //new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'), 
        new SlashCommandBuilder().setName('play').setDescription('Plays a song from YouTube').addStringOption(option => option.setName('song').setDescription('The song to play').setRequired(true)),
      ]},
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
}})();


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('pong!');
  }
  if (commandName === 'play') {
    const song = interaction.options.getString('song');
    try{
      client.distube.play(interaction.member.voice.channel, song, {
      member: interaction.member,
      textChannel: interaction.channel,
      message: null
    });
    await interaction.reply(`Playing ${song}`);}
    catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while playing the song.');
  }
}});

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);

  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const command = args.shift().toLowerCase();

  if (/*command === 'play' || */ command === 'p') {
    // Komut: !play <youtube-linki>
    client.distube.play(message.member.voice.channel, args.join(' '), {
      member: message.member,
      textChannel: message.channel,
      message
    });
  }

  if (command === 'skip') {
    // Komut: !skip
    try {
      client.distube.skip(message.member.voice.channel);
      message.channel.send('Skipping the current song.');
    } catch (error) {
      console.error(error);
      message.channel.send('There is no song to skip or an error occurred.');
    }
  }

  if (command === 'stop' || command === 's') {
    // Komut: !stop
    try {
      client.distube.stop(message.member.voice.channel);
      message.channel.send('Stopping the music.');
    } catch (error) {
      console.error(error);
      message.channel.send('An error occurred while stopping the music.');
    }
  }
});

client.distube
  .on('playSong', (queue, song) => {
    const embed = {
      title: 'Music Bot',
      description: `Now playing: **${song.name}**`,
      fields: [
        {
          name: 'Queue',
          value: `There are ${queue.songs.length} songs in the queue.`
        }
      ],
      color: 0xff0000
    };
    const sentMessages = queue.textChannel.messages.cache.filter(
      (msg) => msg.author.id === client.user.id
    );
    queue.textChannel.bulkDelete(sentMessages).then(() => {
      queue.textChannel.send({ embeds: [embed] });
});
});

// Botunuzun token'ını buraya girin
client.login(TOKEN);
