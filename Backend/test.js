import { Client, GatewayIntentBits } from "discord.js";
import WebSocket from "ws";
import { insultsArray, jokesArray } from "./data.js";
import https from "https";
import express from "express";
import { sslConfig, tokenID, channelID } from './config.js'; // Importing config
import { appendLog, sendLastTenLogs } from './logger.js';


const app = express();

// loading SSL cert
const server = https.createServer(sslConfig);

const wss = new WebSocket.Server({ server });


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Creating commands for the bot to use (sooon connected to the UI)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    // Handling "insult" command
    if (interaction.commandName === "insult") {
      const randomIndex = Math.floor(Math.random() * insultsArray.length);
      const randomInsult = insultsArray[randomIndex];
      await interaction.reply({ content: randomInsult, ephemeral: false }); // Now visible to everyone
    }
    // Handling "joke" command
    else if (interaction.commandName === "joke") {
      const randomIndex = Math.floor(Math.random() * jokesArray.length);
      const randomJoke = jokesArray[randomIndex];
      await interaction.reply({ content: randomJoke, ephemeral: false }); // Now visible to everyone
    }
  } catch (error) {
    console.error(`Failed to send response for ${interaction.commandName}:`, error);
    // Fallback reply in case of an error
    await interaction.reply({ content: "Oops! Something went wrong.", ephemeral: false }); // Now visible to everyone
  }
});



client.on("messageCreate", async (message) => {
  // if (message.author.bot) return; 

  if (message.content === "/insult") {
    const randomInsult = insultsArray[Math.floor(Math.random() * insultsArray.length)];
    message.channel.send(randomInsult);
    return; // Stop further processing
  }

  if (message.content === "/joke") {
    const randomJoke = jokesArray[Math.floor(Math.random() * jokesArray.length)];
    message.channel.send(randomJoke);
    return; // Stop further processing
  }

  if (message.channel.id === channelID.trim()) {
    // Broadcast the message to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`${message.author.tag}: ${message.content}`);
      }
    });

    // Append message to logs.json
    const logEntry = {
      timestamp: new Date().toISOString(),
      author: message.author.tag,
      channel: message.channel.name,
      content: message.content
    };
    appendLog(logEntry);

  }
});


wss.on("connection", async (ws) => {
  const lastTenLogs = await sendLastTenLogs(); // Fetch the last ten logs
  ws.send(JSON.stringify({ type: 'initialLogs', data: lastTenLogs })); // Already sending JSON here

  ws.on("message", async (message) => {
    const text = message.toString(); // Convert to string if not already
    if (text.trim() !== "") {
      // Prepare a JSON object to send
      const messageData = {
        type: 'newMessage',
        data: {
          text: text,
          timestamp: new Date().toISOString(),
        }
      };
      // Send JSON string to the WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageData));
        }
      });

      // You might still want to send this text to a Discord channel or handle it differently
      const channel = await client.channels.fetch(channelID);
      channel.send(text);
    }
  });
});



server.listen(8080, () => {
  console.log('HTTPS and WebSocket server listening on port 8080');
});

client.login(tokenID);
