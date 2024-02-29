import React, { useState, useEffect } from 'react';
import insultsArray from './sabQasf';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://trashcentre.ddns.net:8080');
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
      console.log('WebSocket connection closed');
    };
    setWs(ws);
    return () => ws.close();
  }, []);




  const sendMessage = () => {
    if (input.trim() !== '') {
      const randomInsult = insultsArray[Math.floor(Math.random() * insultsArray.length)];
      console.log(randomInsult); // Log an insult when sending a message
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
