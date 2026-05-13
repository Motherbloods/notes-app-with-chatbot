const Note = require("../models/notes.js");
const generateEmbedding = async (note) => {
  try {
    if (!note || note.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Notes App Embedding",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: note,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error response:", errorText);
      throw new Error(`OpenRouter API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Error generating embedding:", e.message);

    if (e.response) {
      console.error("API Error:", e.response.data);
    }

    throw e;
  }
};
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

const searchSemanticNotesService = async (
  query,
  notes,
  topK = 5,
  minSimilarity = 0.5,
) => {
  try {
    const embedding = await generateEmbedding(query);
    const queryEmbedding = embedding.data[0].embedding;

    const resultsWithSimilarity = notes
      .filter((note) => {
        const valid =
          note.embedding &&
          Array.isArray(note.embedding) &&
          note.embedding.length > 0;

        return valid;
      })
      .map((note) => {
        const similarity = cosineSimilarity(queryEmbedding, note.embedding);

        return {
          ...(note.toObject ? note.toObject() : note),
          similarity,
        };
      })
      .filter((note) => note.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return resultsWithSimilarity;
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw error;
  }
};

const searchHybridNotesService = async (
  query,
  keywordResults,
  allNotes,
  topK = 10,
) => {
  try {
    const semanticResults = await searchSemanticNotesService(
      query,
      allNotes,
      topK * 2,
    );

    const combinedMap = new Map();

    // ===== KEYWORD PHASE =====
    keywordResults.forEach((note) => {
      const id = note._id.toString();

      combinedMap.set(id, {
        ...(note.toObject ? note.toObject() : note),
        score: 1.0,
        matchType: "keyword",
      });
    });

    semanticResults.forEach((note) => {
      const id = note._id.toString();

      if (combinedMap.has(id)) {
        const existing = combinedMap.get(id);

        const boostedScore = note.similarity * 1.2;

        existing.score = Math.max(existing.score, boostedScore);
        existing.matchType = "both";
        existing.similarity = note.similarity;
      } else {
        combinedMap.set(id, {
          ...note,
          score: note.similarity,
          matchType: "semantic",
        });
      }
    });

    const finalResults = Array.from(combinedMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return finalResults;
  } catch (error) {
    console.error("Error in hybrid search:", error);
    throw error;
  }
};

module.exports = {
  generateEmbedding,
  searchSemanticNotesService,
  searchHybridNotesService,
};
