const { analyzingNotesWithLLM } = require("../services/analyzing.service");

const analyzeNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Note content is required" });
    }

    const analysisResult = await analyzingNotesWithLLM(content);

    return res.status(200).json({
      message: "Analysis success",
      data: analysisResult,
    });
  } catch (error) {
    console.error("Error in analyzeNote:", error);

    return res.status(500).json({
      error: "Failed to analyze note",
    });
  }
};

module.exports = { analyzeNote };
