import { Client, GatewayIntentBits } from 'discord.js';
import WebSocket from 'ws';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const wss = new WebSocket.Server({ port: 8080 });

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
    const text = message.toString(); // Convert to string if not already
    if (text.trim() !== '') {
      const channel = await client.channels.fetch(channelID);
      channel.send(text);
    }
    ws.onclose = (event) => {
      console.log('WebSocket connection closed', event);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
  });
});




client.login(tokenID);
