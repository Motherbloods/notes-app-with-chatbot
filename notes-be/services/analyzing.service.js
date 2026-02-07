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
          max_tokens: 4000,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: `You are a code analyzer and content classifier. Return ONLY valid JSON.

CATEGORIES:
- "kode": Any programming code (JavaScript, Python, Java, HTML, CSS, SQL, etc.)
- "target_harian": To-do lists, daily tasks, checklists, goals
- "ide": Ideas, brainstorming, concepts, project plans, feature requests
- "catatan": Meeting notes, documentation, general notes, summaries
- "lainnya": Anything else

CODE ANALYSIS RULES (when category is "kode"):
1. Detect language accurately
2. Provide meaningful context (what the code does)
3. Return COMPLETE original code in "formatted" field (do NOT truncate)
4. Return FIXED/IMPROVED code in "suggested" field with all issues resolved
5. Find ALL issues: syntax errors, logic bugs, bad practices, security issues
6. For each error, provide:
   - Exact line number (in original code)
   - Type: "error" (breaks code) | "warning" (bad practice) | "suggestion" (improvement)
   - Clear message explaining the issue
   - Suggested fix inline

EXAMPLE:

Input code (broken):
\`\`\`
const x = data.user.name;
console.log(x)
\`\`\`

Output JSON:
{
  "category": "kode",
  "confidence": 0.95,
  "codeMetadata": {
    "language": "JavaScript",
    "fileContext": "Accessing user data without null checking",
    "formatted": "const x = data.user.name;\\nconsole.log(x)",
    "suggested": "// Safely access nested properties\\nconst x = data?.user?.name ?? 'Anonymous';\\nconsole.log(x);",
    "errors": [
      {
        "line": 1,
        "type": "error",
        "message": "Potential TypeError: Cannot read property 'name' of undefined if data.user is null/undefined. Use optional chaining.",
        "fix": "const x = data?.user?.name ?? 'Anonymous';"
      }
    ]
  }
}

Return ONLY JSON, no markdown fences.`,
            },
            {
              role: "user",
              content: `Classify and analyze this content. If it's code, find ALL issues and provide the corrected version:

"""
${note}
"""

Return JSON:
{
  "category": "...",
  "confidence": 0.0-1.0,
  "codeMetadata": {
    "language": "...",
    "fileContext": "...",
    "formatted": "original complete code here",
    "suggested": "fixed/improved complete code here",
    "errors": [{
      "line": number,
      "type": "error|warning|suggestion",
      "message": "detailed explanation",
      "fix": "corrected line of code"
    }]
  }
}`,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const messageContent = data.choices[0].message.content;
    let parsedResult;
    try {
      let cleanContent = messageContent.trim();
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent
          .replace(/^```(?:json)?\n?/, "")
          .replace(/\n?```$/, "")
          .trim();
      }

      parsedResult = JSON.parse(cleanContent);

      // Validation
      const validCategories = [
        "target_harian",
        "ide",
        "kode",
        "catatan",
        "lainnya",
      ];
      if (!validCategories.includes(parsedResult.category)) {
        console.warn(
          `Invalid category: ${parsedResult.category}, defaulting to 'lainnya'`,
        );
        parsedResult.category = "lainnya";
      }

      if (
        typeof parsedResult.confidence !== "number" ||
        parsedResult.confidence < 0 ||
        parsedResult.confidence > 1
      ) {
        parsedResult.confidence = 0.5;
      }

      if (parsedResult.category !== "kode") {
        parsedResult.codeMetadata = null;
      } else {
        if (!parsedResult.codeMetadata) {
          parsedResult.codeMetadata = {
            language: "Unknown",
            fileContext: "Code snippet",
            formatted: note,
            suggested: note,
            errors: [],
          };
        }

        parsedResult.codeMetadata.formatted =
          parsedResult.codeMetadata.formatted || note;
        parsedResult.codeMetadata.suggested =
          parsedResult.codeMetadata.suggested ||
          parsedResult.codeMetadata.formatted;
        parsedResult.codeMetadata.errors = Array.isArray(
          parsedResult.codeMetadata.errors,
        )
          ? parsedResult.codeMetadata.errors
          : [];
      }
    } catch (error) {
      console.error("Failed to parse LLM response:", error);
      console.error("Raw response:", messageContent);

      // Fallback
      return {
        category: "lainnya",
        confidence: 0.3,
        codeMetadata: null,
      };
    }
    return parsedResult;
  } catch (error) {
    console.error("Error in analyzingNotesWithLLM:", error);

    return {
      category: "lainnya",
      confidence: 0.1,
      codeMetadata: null,
    };
  }
};

module.exports = {
  analyzingNotesWithLLM,
};
