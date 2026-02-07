const Note = require("../models/notes.js");

const createNoteService = async (noteData) => {
  try {
    const {
      content,
      contentType,
      category,
      language,
      analysis,
      suggestedCode,
    } = noteData;

    const confidence = analysis?.confidence ?? 0;
    const analysisErrors = Array.isArray(analysis?.errors)
      ? analysis.errors.map((err) => ({
          line: err.line,
          type: err.type || "error",
          message: err.message,
          fix: err.fix || null,
        }))
      : [];

    // Validation
    if (!content || !category) {
      throw new Error("Missing required fields: content and category");
    }

    if (confidence < 0 || confidence > 1) {
      throw new Error("Invalid confidence value (must be between 0 and 1)");
    }

    const newNote = new Note({
      content,
      contentType: contentType || "text",
      category,
      language: language || null,
      confidence,
      analysisErrors,
      suggestedCode: suggestedCode || null, // Store the corrected version
    });

    return await newNote.save();
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

const getCategoriesNotesCountService = async () => {
  try {
    const counts = await Note.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);
    return counts;
  } catch (error) {
    console.error("Error fetching categories notes count:", error);
    throw error;
  }
};

const getNotesByCategoryService = async (categoryKey) => {
  try {
    const notes = await Note.find({ category: categoryKey }).sort({
      timestamp: -1,
    });
    console.log("Fetched notes:", notes);
    return notes;
  } catch (error) {
    console.error("Error fetching notes by category:", error);
    throw error;
  }
};

const updateNoteService = async (noteId, updateData) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(noteId, updateData, {
      new: true,
    });
    return updatedNote;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

module.exports = {
  createNoteService,
  getCategoriesNotesCountService,
  getNotesByCategoryService,
  updateNoteService,
};
