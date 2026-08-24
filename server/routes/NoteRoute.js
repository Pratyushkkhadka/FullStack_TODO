const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const auth = require("../middleware/auth");

// GET /api/notes
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// POST /api/notes
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newNote = new Note({
      userId: req.user.id,
      title,
      content: content || "",
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "Medium",
    });

    const savedNote = await newNote.save();
    return res.status(201).json(savedNote);
  } catch (err) {
    return res.status(500).json({ message: "Error creating note", error: err.message });
  }
});

// PUT /api/notes/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: "Task not found" });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// DELETE /api/notes/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deletedNote) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;