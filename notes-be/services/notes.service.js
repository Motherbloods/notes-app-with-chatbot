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

module.exports = { createNoteService };
