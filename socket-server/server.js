const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { RateLimiterMemory } = require("rate-limiter-flexible");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const MAX_MESSAGE_LENGTH = 600;

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 actions (new messages or edits)
  duration: 5, // per 5 seconds
});

const handleRateLimit = async (socket, action, callback) => {
  try {
    await rateLimiter.consume(socket.handshake.address);
    callback();
  } catch (rejRes) {
    console.log(
      `Rate limit exceeded for ${action} by`,
      socket.handshake.address,
    );
    socket.emit(
      "message_error",
      `Rate limit exceeded. Please wait before ${action} messages.`,
    );
  }
};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", (message) => {
    handleRateLimit(socket, "sending", () => {
      if (message.message.length <= MAX_MESSAGE_LENGTH) {
        console.log("Received message:", message);
        io.emit("message", message);
      } else {
        console.log("Message exceeds the maximum length");
        socket.emit("message_error", "Message exceeds the maximum length");
      }
    });
  });

  socket.on("updateMessage", (updatedMessage) => {
    handleRateLimit(socket, "editing", () => {
      if (updatedMessage.message.length <= MAX_MESSAGE_LENGTH) {
        console.log("Updated message:", updatedMessage);
        io.emit("messageUpdated", updatedMessage);
      } else {
        console.log("Updated message exceeds the maximum length");
        socket.emit("message_error", "Message exceeds the maximum length");
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
