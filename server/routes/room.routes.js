const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");

// Create a new room
router.post("/", auth, async (req, res) => {
  try {
    const roomId = uuidv4();
    const room = new Room({
      roomId,
      host: req.user.id,
    });

    await room.save();
    res.status(201).json({ roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get room info
router.get("/:roomId", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate(
      "host participants",
      "name email"
    );
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Join a room
router.post("/:roomId/join", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }

    res.json({ message: "Joined room successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
