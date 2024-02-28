import { Client, GatewayIntentBits } from 'discord.js';
import WebSocket from 'ws';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const wss = new WebSocket.Server({ port: 5000 });

const tokenID = 'MTIxMTc0MzI3Nzc3OTUyMTY0OA.GP1Q7K.SuEYrlEnW3GslWpjDqUhosQWcmYrjQ3WXqYGEs';
const clientID = '1211743277779521648';
const channelID = '1212438079068180532';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.channel.id === channelID.trim()) {
    // Broadcast the message to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Message from ${message.author.tag} in channel ${message.channel.name}: ${message.content}`);
      }
    });
  }
});

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        if (message.trim() !== '') {
          const channel = await client.channels.fetch(channelID);
          channel.send(message);
        }
      });
});

client.login(tokenID);
