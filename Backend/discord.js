import { Client, GatewayIntentBits } from 'discord.js';
import readline from 'readline';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // This line is necessary to access message content
  ],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const tokenID = 'MTIxMTc0MzI3Nzc3OTUyMTY0OA.GP1Q7K.SuEYrlEnW3GslWpjDqUhosQWcmYrjQ3WXqYGEs'
const clientID = '1211743277779521648'
const channelID = '1212438079068180532'
//const channelID = '1069413460875690074' // Removed the spaces around the channel ID

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  
    // Prompt for input in the terminal
    rl.setPrompt('Enter a message to send: ');
    rl.prompt();
  
    rl.on('line', async (line) => {
      // Fetch the channel
      const channel = await client.channels.fetch(channelID);
      
      // Send the message to the channel
      channel.send(line);
  
      rl.prompt(); // Prompt for the next input
    });
  });

client.on('messageCreate', async message => {
    //console.log(message); // Log the entire message object
    if (message.channel.id === channelID.trim()) {
      console.log(`Message from ${message.author.tag} in channel ${message.channel.name}: ${message.content}`);
    }
  });
  


client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.login(tokenID);
