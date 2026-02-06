const analyzingNotesWithLLM = async (note) => {
  try {
    const apikey = process.env.OPENROUTER_API_KEY;
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apikey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: `
You are a strict classifier and analyzer.

You MUST return ONLY valid JSON.
No markdown.
No explanation.

Categories:
- target_harian
- ide
- kode
- catatan
- lainnya

Rules:
- If category != "kode", set codeMetadata to null
- confidence must be float between 0 and 1
- errors must always be an array
`,
            },
            {
              role: "user",
              content: `
Analisis konten berikut:

"""
${note}
"""

Output EXACT JSON structure:

{
  "category": "target_harian | ide | kode | catatan | lainnya",
  "confidence": number,
  "codeMetadata": {
    "language": string,
    "fileContext": string,
    "formatted": string,
    "errors": [
      { "line": number, "type": string, "message": string }
    ]
  }
}
`,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const messageContent = data.choices[0].message.content;
    let parsedResult;
    try {
      parsedResult = JSON.parse(messageContent);
    } catch (error) {
      throw new Error(
        "Failed to parse LLM response as JSON: " + messageContent,
      );
    }
    return parsedResult;
  } catch (error) {
    console.error("Error in analyzingNotesWithLLM:", error);
    throw error;
  }
};

module.exports = {
  analyzingNotesWithLLM,
};
