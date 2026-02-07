const { createNoteService } = require("../services/notes.service.js");

const createNote = async (req, res) => {
  try {
    const newNote = await createNoteService(req.body);
    res.status(201).json({
      message: "Note created successfully",
      note: newNote,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createNote };
