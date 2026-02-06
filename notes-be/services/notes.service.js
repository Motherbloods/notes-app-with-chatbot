const Note = require("../models/notes.js");

const createNoteService = async (noteData) => {
  try {
    const { content, contentType, category, language, analysis } = noteData;

    const confidence = analysis?.confidence;
    const analysisErrors = Array.isArray(analysis?.errors)
      ? analysis.errors
      : [];
    if (!content || !category || confidence === undefined) {
      throw new Error("Missing required fields");
    }

    if (confidence < 0 || confidence > 1) {
      throw new Error("Invalid confidence value");
    }

    const newNote = new Note({
      content,
      contentType,
      category,
      language,
      confidence,
      analysisErrors,
    });

    return await newNote.save();
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

module.exports = { createNoteService };
