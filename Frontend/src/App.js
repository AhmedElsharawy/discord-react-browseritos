import React, { useState, useEffect } from 'react';
// import insultsArray from './s abQasf';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket('wss://trashcentre.com:443');
  
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };
  
      ws.onmessage = (event) => {
        setMessages((prevMessages) => [...prevMessages, event.data]);
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
