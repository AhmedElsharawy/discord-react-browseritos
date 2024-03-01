import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const sslConfig = {
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  key: fs.readFileSync(process.env.SSL_KEY_PATH)
};

const tokenID = process.env.TOKEN_ID;
const channelID = process.env.CHANNEL_ID;

export { sslConfig, tokenID, channelID };
