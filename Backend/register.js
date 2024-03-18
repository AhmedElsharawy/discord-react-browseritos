import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, tokenID} from './config.json';


const commands = [
  {
    name: 'insult',
    description: 'Sends a random insult!',
  }, 
  {
    name: 'joke',
    description: 'sends a random joke!',
  }

];

const rest = new REST({ version: '9' }).setToken(tokenID);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
