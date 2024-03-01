import React, { useState, useEffect } from 'react';
// import insultsArray from './s abQasf';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket('wss://trashcentre.com:8080');
  
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };
  
      ws.onmessage = (event) => {
        // Attempt to parse the event data as JSON
        try {
          const data = JSON.parse(event.data);
          // Check if the received data is an array (indicating it's the initial log data)
          if (Array.isArray(data)) {
            setMessages(data.map(log => `from ${log.author}: ${log.content}`));
          } else {
            // If data is an object but not an array, handle accordingly
            // This part can be customized based on the specific data structure you expect
            console.log("Received JSON object", data);
          }
        } catch (error) {
          // If JSON.parse() fails, it means the message is not in JSON format
          // Treat the message as plain text and add it to the messages array
          setMessages((prevMessages) => [...prevMessages, event.data]);
        }
      };
      
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      ws.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        setTimeout(connect, 2000); // Try to reconnect every 2 seconds
      };
  
      setWs(ws);
    }
  
    connect();
  
    return () => ws?.close();
  }, []);
  


  const sendMessage = () => {
    if (input.trim() !== '') {
      ws?.send(input);
      setInput('');
    }
  };
  


  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
