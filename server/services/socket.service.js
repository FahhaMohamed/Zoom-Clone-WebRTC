const socketio = require("socket.io");
const { formatMessage } = require("../utils/messages");

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: [process.env.CLIENT_URL, "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New WebSocket Connection");

    // join a room
    socket.on("joinRoom", ({ roomId, user }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.user = user;

      // Welcome the current user
      socket.emit(
        "message",
        formatMessage("Admin", "Welcome to Video Conference!")
      );

      // Broadcast when a user connects - Server tells to others
      socket.broadcast
        .to(roomId)
        .emit(
          "message",
          formatMessage("Admin", `${user.name} has joined the chat`)
        );

      // Send users and room info
      io.to(roomId).emit("roomUsers", {
        roomId,
        users: getRoomUsers(roomId),
      });

      // Listen for chat message
      socket.on("chatMessage", (msg) => {
        const user = socket.user;
        io.to(socket.roomId).emit("message", formatMessage(user.name, msg));
      });

      //WebRTC signaling
      socket.on("offer", (data) => {
        socket.to(data.target).emit("offer", data);
      });

      socket.on("answer", (data) => {
        socket.to(data.target).emit("answer", data);
      });

      socket.on("ice-candidate", (data) => {
        socket.to(data.target).emit("ice-candidate", data.candidate);
      });

      // Disconnect
      socket.on("disconnect", () => {
        if (socket.roomId) {
          io.to(socket.roomId).emit(
            "message",
            formatMessage(
              "Admin",
              `${socket.user?.name || "A user"} has left the chat`
            )
          );

          // Send users and room info
          io.to(socket.roomId).emit("roomUsers", {
            roomId: socket.roomId,
            users: getRoomUsers(socket.roomId),
          });
        }
      });
    });
  });
};

const getRoomUsers = (roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];

  return Array.from(room).map((socketId) => {
    return io.sockets.sockets.get(socketId).user;
  });
};

module.exports = { initSocket };
