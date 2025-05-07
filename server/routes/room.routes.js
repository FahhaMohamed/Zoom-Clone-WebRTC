const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");

// Create a new room
router.post("/create", auth, async (req, res) => {
  let { roomId, participantsCount } = req.body;

  if (!participantsCount) {
    res
      .status(401)
      .json({ status: false, message: "Please enter participants count" });
  }

  try {
    if (!roomId) {
      roomId = uuidv4();
    }
    let room = new Room({
      roomId,
      participantsCount,
      host: req.user.id,
    });

    await room.save();

    room = room.toObject();
    delete room.__v;
    const username = req.user.name;
    res.status(201).json({
      status: true,
      message: "Room created successfully",
      username,
      room,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get room info
router.post("/info", auth, async (req, res) => {
  const { name, roomId } = req.body;

  const username = req.user.name;

  if (!name) {
    return res
      .status(400)
      .json({ status: false, message: "Please enter name" });
  }
  if (name !== username) {
    return res.status(400).json({ status: false, message: "Invalid user" });
  }

  try {
    let room = await Room.findOne({ roomId })
      .select("-__v")
      .populate("host participants", "name email");
    if (!room)
      return res.status(404).json({ status: false, message: "Room not found" });

    console.log("user : ", room);
    res.status(200).json({
      status: true,
      message: "Room details fetched successfully",
      username,
      room,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Join a room
router.get("/:roomId/join", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).select(
      "-__v"
    );
    if (!room)
      return res.status(404).json({ status: false, message: "Room not found" });

    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }

    const username = req.user.name;

    res.json({
      status: true,
      message: "Joined room successfully",
      username,
      room,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
