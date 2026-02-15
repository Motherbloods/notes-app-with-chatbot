const Note = require("../models/notes.js");
const { analyzingNotesWithLLM } = require("./analyzing.service.js");
const { generateEmbedding } = require("./embbeding.service.js");

const createNoteService = async (noteData) => {
  try {
    const {
      userId,
      content,
      contentType,
      category,
      language,
      analysis,
      suggestedCode,
      originalContent,
      wasReformatted,
      lineFormats,
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

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (confidence < 0 || confidence > 1) {
      throw new Error("Invalid confidence value (must be between 0 and 1)");
    }

    const embedding = await generateEmbedding(content);
    const embeddingVector = embedding.data[0].embedding;

    const newNote = new Note({
      userId,
      content,
      originalContent: originalContent || null,
      wasReformatted,
      contentType: contentType || "text",
      category,
      embedding: embeddingVector,
      language: language || null,
      confidence,
      analysisErrors,
      lineFormats: lineFormats || [],
      suggestedCode: suggestedCode || null,
    });
    console.log("New Note (object):", newNote.toObject());

    return await newNote.save();
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

const getCategoriesNotesCountService = async (userId) => {
  try {
    const counts = await Note.aggregate([
      { $match: { deletedAt: null, userId: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);
    return counts;
  } catch (error) {
    console.error("Error fetching categories notes count:", error);
    throw error;
  }
};

const getNotesByCategoryService = async (categoryKey, userId) => {
  try {
    const notes = await Note.find({
      category: categoryKey,
      userId: userId,
    }).sort({
      timestamp: -1,
    });
    return notes;
  } catch (error) {
    console.error("Error fetching notes by category:", error);
    throw error;
  }
};

const updateNoteService = async (noteId, updateData, userId) => {
  try {
    const existingNote = await Note.findOne({
      _id: noteId,
      userId: userId,
    });

    if (!existingNote) {
      throw new Error("Note not found or unauthorized");
    }

    const shouldReanalyze = updateData.reanalyze === true;

    let updatedFields = { ...updateData };

    delete updatedFields.reanalyze;

    if (shouldReanalyze) {
      const analyzing = await analyzingNotesWithLLM(updateData.content);
      const contentType = analyzing?.category === "kode" ? "code" : "text";

      updatedFields = {
        ...updatedFields,
        contentType,
      };

      if (contentType === "code" && analyzing.codeMetadata != null) {
        updatedFields = {
          ...updatedFields,
          language: analyzing.codeMetadata?.language || "N/A",
          suggestedCode: analyzing.codeMetadata?.suggested || "",
          analysisErrors: analyzing.codeMetadata?.errors || [],
          confidence: analyzing.confidence || 0,
        };
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(noteId, updatedFields, {
      new: true,
    });
    return updatedNote;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

const deleteNoteByIdService = async (noteId, userId) => {
  try {
    const existingNote = await Note.findOne({
      _id: noteId,
      userId: userId,
    });

    if (!existingNote) {
      throw new Error("Note not found or unauthorized");
    }

    await Note.findByIdAndUpdate(noteId, {
      deletedAt: new Date(),
    });
  } catch (error) {
    console.error("Error soft deleting note:", error);
    throw error;
  }
};

module.exports = {
  createNoteService,
  getCategoriesNotesCountService,
  getNotesByCategoryService,
  updateNoteService,
  deleteNoteByIdService,
};
