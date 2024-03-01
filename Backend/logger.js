import fs from 'fs';

// Function to append message to logs.json
export const appendLog = (logEntry) => {
  fs.readFile('./logs.json', (err, data) => {
    let logs = [];
    if (!err && data.toString().trim()) {
      try {
        logs = JSON.parse(data.toString());
      } catch (parseError) {
        console.error('Error parsing logs.json:', parseError);
      }
    }
    logs.push(logEntry);

    fs.writeFile('./logs.json', JSON.stringify(logs, null, 2), (writeErr) => {
      if (writeErr) console.error('Error writing to logs.json:', writeErr);
    });
  });
};

// Function to send the last 10 logs to a WebSocket client
export const sendLastTenLogs = (ws) => {
  fs.readFile('./logs.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading logs.json:', err);
      ws.send(JSON.stringify([]));
      return;
    }
    
    if (data.trim()) {
      try {
        const logs = JSON.parse(data);
        const lastTenLogs = logs.slice(-10);
        ws.send(JSON.stringify(lastTenLogs));
      } catch (parseError) {
        console.error('Error parsing logs.json:', parseError);
        ws.send(JSON.stringify([]));
      }
    } else {
      console.log('logs.json is empty.');
      ws.send(JSON.stringify([]));
    }
  });
};
