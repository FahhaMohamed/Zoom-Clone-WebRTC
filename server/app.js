const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/rooms", require("./routes/room.routes"));

module.exports = app;