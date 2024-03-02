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
        setTimeout(connect, 2000);
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
    <div className="flex min-h-screen items-center justify-center">
      <div className="aspect-w-1 aspect-h-1 w-full rounded bg-gray-700 p-4 shadow md:w-1/2">
        <div className="mb-4 h-64 overflow-auto rounded bg-gray-800 p-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-2">
              <div className="inline-block rounded bg-pink-500 px-2 py-1 text-white">
                {message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage}>
          <div className="flex">
            <input
              type="text"
              className="mr-2 flex-grow rounded border bg-gray-800 px-2 py-1 text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-pink-500 px-4 py-1 text-white"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
