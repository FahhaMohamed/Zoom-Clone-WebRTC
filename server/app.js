const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "https://videoconnect-production-a37f.up.railway.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/room", require("./routes/room.routes"));

module.exports = app;
