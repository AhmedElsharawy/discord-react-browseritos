import express from 'express';
import { createServer } from 'https';
import fs from 'fs';
import { client } from './discord/bot.js';
import { setupWebSocket } from './websocket/websocketSetup.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer({
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  key: fs.readFileSync(process.env.SSL_KEY_PATH)
});

setupWebSocket(server);

server.listen(8080, () => {
  console.log('HTTPS and WebSocket server listening on port 8080');
});

client.login(process.env.TOKEN_ID);
