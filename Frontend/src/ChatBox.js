import React, { useState, useEffect, useRef } from "react";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let ws;

    function connect() {
      ws = new WebSocket("wss://trashcentre.com:8080");

      ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
      
          if (data.type === 'initialLogs' && Array.isArray(data.data)) {
            setMessages(
              data.data.map((log) => `${log.author}: ${log.content}`),
            );
          } else if (data.text && data.timestamp) {
            setMessages((prevMessages) => [...prevMessages, `${data.text} at ${data.timestamp}`]);
          } else {
            console.log("Received JSON object of different type", data);
          }
        } catch (error) {
          console.error("Error parsing JSON data:", error);
          setMessages((prevMessages) => [...prevMessages, event.data]);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed. Attempting to reconnect...");
        setTimeout(connect, 1000);
      };

      setWs(ws);
    }

    connect();

    return () => ws?.close();
  }, []);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (input.trim() !== "") {
      ws?.send(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col chatbox">
    <div className="flex-grow overflow-auto scrollbar-hide my-4 mx-auto p-4 w-full max-w-4xl bg-gray-900 flex flex-col-reverse rounded-lg">
      {messages.map((message, index) => (
        <div key={index} className="mb-2 last:mb-0">
          <div className="inline-block rounded-lg bg-pink-600 px-4 py-2 text-white shadow">
            {message}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
    <form onSubmit={sendMessage} className="mb-4 mx-auto w-full max-w-4xl">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow rounded-lg border-0 bg-gray-900 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-pink-600 px-6 py-2 text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          Send
        </button>
      </div>
    </form>
  </div>
  
  );
}

export default ChatBox;
