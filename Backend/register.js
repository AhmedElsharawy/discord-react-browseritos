import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const token = 'MTIxMTc0MzI3Nzc3OTUyMTY0OA.GP1Q7K.SuEYrlEnW3GslWpjDqUhosQWcmYrjQ3WXqYGEs';
const clientId = '1211743277779521648';
const guildId = '884942140252258344'; // Make sure to add your Guild ID here

const commands = [
  {
    name: 'insult',
    description: 'Sends a random insult!',
  }, 
  {
    name: 'kick',
    description: 'Kicks a user from the server',
  }

];

const rest = new REST({ version: '9' }).setToken(token);

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
