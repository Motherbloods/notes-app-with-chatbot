const { searchLiveNotesService } = require("../services/embbeding.service");

const searchLiveNotes = async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "";
    console.log("ini query", req.query.q);
    const result = await searchLiveNotesService(query);

    return res.json(result);
  } catch (e) {
    console.error("Search API error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { searchLiveNotes };
