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

module.exports = { generateEmbedding };
