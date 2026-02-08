const {
  createNoteService,
  getCategoriesNotesCountService,
  getNotesByCategoryService,
  updateNoteService,
  deleteNoteByIdService,
} = require("../services/notes.service.js");

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

const getCategoriesNotesCount = async (req, res) => {
  try {
    const counts = await getCategoriesNotesCountService();
    res.status(200).json(counts);
  } catch (error) {
    console.error("Error fetching categories notes count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getNotesByCategory = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const notes = await getNotesByCategoryService(categoryKey);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const updateData = req.body;
    const updatedNote = await updateNoteService(noteId, updateData);
    res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteNoteByIdService(id);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createNote,
  getCategoriesNotesCount,
  getNotesByCategory,
  updateNote,
  deleteNoteById,
};
