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
    console.log("Query:", query);
    console.log("Total notes:", notes.length);

    const embedding = await generateEmbedding(query);
    const queryEmbedding = embedding.data[0].embedding;

    console.log("Query embedding length:", queryEmbedding.length);

    const resultsWithSimilarity = notes
      .filter((note) => {
        const valid =
          note.embedding &&
          Array.isArray(note.embedding) &&
          note.embedding.length > 0;

        if (!valid) {
          console.log("Invalid embedding for note:", note._id);
        }

        return valid;
      })
      .map((note) => {
        if (note.embedding.length !== queryEmbedding.length) {
          console.log("Dimension mismatch:", {
            noteId: note._id,
            noteEmbeddingLength: note.embedding.length,
            queryEmbeddingLength: queryEmbedding.length,
          });
        }

        const similarity = cosineSimilarity(queryEmbedding, note.embedding);
        console.log("Similarity raw:", {
          id: note._id,
          similarity,
        });
        return {
          ...(note.toObject ? note.toObject() : note),
          similarity,
        };
      })
      .filter((note) => note.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log("Final results:", resultsWithSimilarity.length);

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
    console.log("🔎 HYBRID SEARCH DEBUG");
    console.log("Query:", query);
    console.log("Keyword results:", keywordResults.length);
    console.log("Total notes (semantic pool):", allNotes.length);

    const semanticResults = await searchSemanticNotesService(
      query,
      allNotes,
      topK * 2,
    );

    console.log("Semantic results:", semanticResults.length);

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

    console.log("After keyword phase:", combinedMap.size);

    // ===== SEMANTIC PHASE =====
    semanticResults.forEach((note) => {
      const id = note._id.toString();

      if (!note.similarity || isNaN(note.similarity)) {
        console.log("⚠ Invalid similarity:", id, note.similarity);
        return;
      }

      if (combinedMap.has(id)) {
        const existing = combinedMap.get(id);

        const boostedScore = note.similarity * 1.2;

        console.log("Match BOTH:", {
          id,
          similarity: note.similarity,
          boostedScore,
        });

        existing.score = Math.max(existing.score, boostedScore);
        existing.matchType = "both";
        existing.similarity = note.similarity;
      } else {
        console.log("Match SEMANTIC only:", {
          id,
          similarity: note.similarity,
        });

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

    console.log("Final hybrid results:", finalResults.length);
    console.log(
      finalResults.map((r) => ({
        id: r._id,
        score: r.score,
        type: r.matchType,
      })),
    );

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
