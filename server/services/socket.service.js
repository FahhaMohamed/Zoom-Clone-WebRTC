const socketio = require("socket.io");
const { formatMessage } = require("../utils/messages");

let io;
let rooms = {};

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        "https://videoconnect-production-a37f.up.railway.app",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New WebSocket Connection");

    // join a room
    socket.on("joinRoom", ({ roomId, user }) => {
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        return;
      }

      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = {};
      }

      rooms[roomId][socket.id] = user;

      // Inform new user of existing users
      const usersInRoom = Object.entries(rooms[roomId])
        .filter(([id]) => id !== socket.id)
        .map(([id, name]) => ({ id, name }));

      socket.emit("all-users", usersInRoom);

      // Welcome the current user
      socket.emit(
        "message",
        formatMessage("Admin", "Welcome to Video Conference!")
      );

      // Broadcast when a user connects
      socket
        .to(roomId)
        .emit("message", formatMessage("Admin", `${user} has joined the room`));

      // Send users and room info
      io.to(roomId).emit("roomUsers", {
        roomId,
        users: getRoomUsers(roomId),
      });

      // Listen for chat message
      socket.on("chatMessage", (msg) => {
        io.to(roomId).emit("message", formatMessage(user, msg));
      });

      // WebRTC signaling
      socket.on("send-offer", ({ target, offer, caller, name }) => {
        io.to(target).emit("receive-offer", { offer, caller, name });
      });

      socket.on("send-answer", ({ target, answer }) => {
        io.to(target).emit("receive-answer", { answer, from: socket.id });
      });

      socket.on("send-ice", ({ target, candidate }) => {
        io.to(target).emit("receive-ice", { candidate, from: socket.id });
      });

      // Disconnect
      socket.on("disconnect", () => {
        if (rooms[roomId]) {
          delete rooms[roomId][socket.id];
          if (Object.keys(rooms[roomId]).length === 0) {
            delete rooms[roomId];
          } else {
            // Notify remaining users about the disconnection
            socket
              .to(roomId)
              .emit(
                "message",
                formatMessage("Admin", `${user} has left the room`)
              );
            socket.to(roomId).emit("user-left", socket.id);
          }
        }
        console.log("Disconnected:", socket.id);
      });
    });
  });
};

const getRoomUsers = (roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];
  return Array.from(room).map((socketId) => {
    return { id: socketId, name: rooms[roomId]?.[socketId] || "Unknown" };
  });
};

module.exports = { initSocket };
