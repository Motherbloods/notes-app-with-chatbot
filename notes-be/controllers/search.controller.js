const Note = require("../models/notes.js");
const {
  searchSemanticNotesService,
  searchHybridNotesService,
} = require("../services/embbeding.service.js");

const keywordSearch = async (query, userId, limit = 20) => {
  try {
    const regex = new RegExp(query, "i");

    const results = await Note.find({
      userId: userId,
      deletedAt: null,
      $or: [{ content: regex }],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return results;
  } catch (error) {
    console.error("Keyword search error:", error);
    return [];
  }
};

const searchNotes = async (req, res) => {
  try {
    const query = req.query.q?.trim();
    const userId = req.userId;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'q' is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - User ID not found",
      });
    }

    const mode = ["semantic", "hybrid"].includes(req.query.mode)
      ? req.query.mode
      : "hybrid";

    const topK = Number.isInteger(Number(req.query.topK))
      ? Number(req.query.topK)
      : 10;

    const minSimilarity = !isNaN(parseFloat(req.query.minSimilarity))
      ? parseFloat(req.query.minSimilarity)
      : 0.5;

    let result;

    if (mode === "semantic") {
      const notes = await Note.find({
        userId: userId,
        deletedAt: null,
      })
        .select("+embedding")
        .lean();

      result = await searchSemanticNotesService(
        query,
        notes,
        topK,
        minSimilarity,
      );
    } else {
      const keywordResults = await keywordSearch(query, userId, topK * 2);

      const notes = await Note.find({
        userId: userId,
        deletedAt: null,
      })
        .select("+embedding")
        .lean();

      result = await searchHybridNotesService(
        query,
        keywordResults,
        notes,
        topK,
      );
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ Search API error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = { searchNotes };
