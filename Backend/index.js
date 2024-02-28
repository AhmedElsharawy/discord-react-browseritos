const express = require("express");
const socketIo = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: ["http://localhost:3000", "http://192.168.2.83:3000"] },
});

io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);
  socket.join("clock-room");
  socket.emit("send_string", "Salama3rs");

  socket.on("disconnect", (reason) => {
    console.log(reason);
  });
});

setInterval(() => {
  io.to("clock-room").emit("time", new Date());
}, 1000);

server.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log("Server running on Port ", PORT);
});
