import { Client, GatewayIntentBits } from "discord.js";
import WebSocket from "ws";
import { insultsArray, jokesArray } from "./data.js";
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
        client.send(`from ${message.author.tag}: ${message.content}`);
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
      if (!err && data.toString().trim()) {
        try {
          logs = JSON.parse(data.toString());
        } catch (parseError) {
          console.error('Error parsing logs.json:', parseError);
          // You can decide how to handle this error.
          // For example, you might want to initialize `logs` as an empty array or log the error and halt processing.
        }
      }
      logs.push(logEntry);

      fs.writeFile('./logs.json', JSON.stringify(logs, null, 2), (writeErr) => {
        if (writeErr) console.error('Error writing to logs.json:', writeErr);
      });
    });
  }
});


wss.on("connection", (ws) => {
  // Send the last 10 logs to the newly connected client
  fs.readFile('./logs.json', 'utf8', (err, data) => {
   if (err) {
     console.error('Error reading logs.json:', err);
     // Optionally, send an error message or empty log array to the client
     ws.send(JSON.stringify([]));
     return;
   }
   
   // Check if data is not empty and is valid JSON before parsing
   if (data.trim()) {
     try {
       const logs = JSON.parse(data);
       // Send only the last 10 logs
       const lastTenLogs = logs.slice(-10);
       ws.send(JSON.stringify(lastTenLogs));
     } catch (parseError) {
       console.error('Error parsing logs.json:', parseError);
       // Optionally, send an error message or empty log array to the client
       ws.send(JSON.stringify([]));
     }
   } else {
     // If data is empty, log and optionally send an empty array to the client
     console.log('logs.json is empty.');
     ws.send(JSON.stringify([]));
   }
 });


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
