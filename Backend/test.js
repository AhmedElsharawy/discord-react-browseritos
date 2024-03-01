import { Client, GatewayIntentBits } from "discord.js";
import WebSocket from "ws";
import insultsArray from "./data.js";
import https from "https";
import fs from "fs";
import express from "express";

const app = express();

// loading SSL cert
const server = https.createServer({  
  cert: fs.readFileSync('/home/aysal/trashcentre.com_ssl.cer'),
  key: fs.readFileSync('/home/aysal/trashcentre.com_private_key.key')
});

const wss = new WebSocket.Server({ server });



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const tokenID =
  "MTIxMTc0MzI3Nzc3OTUyMTY0OA.GP1Q7K.SuEYrlEnW3GslWpjDqUhosQWcmYrjQ3WXqYGEs";
const clientID = "1211743277779521648";
const channelID = "1212438079068180532";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Creating commands for the bot to use (sooon connected to the UI)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "insult") {
    const randomInsult =
      insultsArray[Math.floor(Math.random() * insultsArray.length)];
    await interaction.reply(randomInsult);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  if (message.content === "/insult") {
    const randomInsult =
      insultsArray[Math.floor(Math.random() * insultsArray.length)];
    message.channel.send(randomInsult);
    return;
  }

  if (message.channel.id === channelID.trim()) {
    // Broadcast the message to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          `from ${message.author.tag}: ${message.content}`,
        );
      }
    });

// Append message to logs.json
const logEntry = {
  timestamp: new Date().toISOString(),
  author: message.author.tag,
  channel: message.channel.name,
  content: message.content
};

// Read current logs, update them, and then write back
fs.readFile('./logs.json', (err, data) => {
  let logs = [];
  if (!err) {
    logs = JSON.parse(data.toString());
  }
  logs.push(logEntry);

  fs.writeFile('./logs.json', JSON.stringify(logs, null, 2), (err) => {
    if (err) console.error('Error writing to logs.json:', err);
  });
});
}
});

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const text = message.toString(); // Convert to string if not already
    if (text.trim() !== "") {
      const channel = await client.channels.fetch(channelID);
      channel.send(text);
    }
    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  });
});

server.listen(8080, () => {
  console.log('HTTPS and WebSocket server listening on port 8080');
});

client.login(tokenID);
