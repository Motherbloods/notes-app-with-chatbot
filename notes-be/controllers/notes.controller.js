const {
  createNoteService,
  getCategoriesNotesCountService,
  getNotesByCategoryService,
  updateNoteService,
  deleteNoteByIdService,
} = require("../services/notes.service.js");
const { generateTitleFromLLM } = require("../services/analyzing.service.js");

const createNote = async (req, res) => {
  try {
    const noteData = {
      ...req.body,
      userId: req.userId,
    };

    const newNote = await createNoteService(noteData);
    res.status(201).json({
      message: "Note created successfully",
      note: newNote,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateTitle = async (req, res) => {
  try {
    const { content } = req.body;
    console.log(content);

    if (!content?.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const title = await generateTitleFromLLM(content);
    res.status(200).json({ title });
  } catch (error) {
    console.error("Error generating title:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCategoriesNotesCount = async (req, res) => {
  try {
    const counts = await getCategoriesNotesCountService(req.userId);
    res.status(200).json(counts);
  } catch (error) {
    console.error("Error fetching categories notes count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getNotesByCategory = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const notes = await getNotesByCategoryService(categoryKey, req.userId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedNote = await updateNoteService(id, updateData, req.userId);
    res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    if (error.message === "Note not found or unauthorized") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteNoteByIdService(id, req.userId);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    if (error.message === "Note not found or unauthorized") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createNote,
  generateTitle,
  getCategoriesNotesCount,
  getNotesByCategory,
  updateNote,
  deleteNoteById,
};
