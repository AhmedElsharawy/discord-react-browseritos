import fs from 'fs/promises';

const LOGS_FILE_PATH = './logs.json';

// Helper function to read logs
const readLogs = async () => {
  try {
    const data = await fs.readFile(LOGS_FILE_PATH, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('logs.json does not exist, creating a new file.');
      await writeLogs([]);
      return [];
    } else {
      console.error('Error reading logs.json:', err);
      throw err;
    }
  }
};

// Helper function to write logs
const writeLogs = async (logs) => {
  try {
    await fs.writeFile(LOGS_FILE_PATH, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error writing to logs.json:', err);
    throw err;
  }
};

// Function to append a message to logs.json
export const appendLog = async (logEntry) => {
  try {
    const logs = await readLogs();
    logs.push(logEntry);
    await writeLogs(logs);
  } catch (err) {
    console.error('Failed to append log:', err);
  }
};

// Function to send the last 10 logs
export const sendLastTenLogs = async () => {
  try {
    const logs = await readLogs();
    return logs.slice(-15);
  } catch (err) {
    console.error('Failed to send logs:', err);
    return [];
  }
};
