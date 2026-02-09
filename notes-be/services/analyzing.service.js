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
          temperature: 0.1,
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

CONTENT REFORMATTING RULES (Per-Line Analysis):
Analyze EACH LINE individually and determine if it should be converted:

**CRITICAL DISTINCTION:**

1. CONVERT TO CHECKLIST (- [ ]) if line is:
   - An ACTIONABLE TASK that can be completed/checked off
   - Something you DO or need to DO
   - Tasks with verbs like: beli, buat, bikin, lari, tulis, kirim, hubungi, etc.
   - Daily tasks, to-dos, goals
   - **Examples that MUST be checklist:**
     * "1. beli susu" → "- [ ] beli susu"
     * "2. bikin fitur login" → "- [ ] bikin fitur login"
     * "3. lari pagi" → "- [ ] lari pagi"
     * "4. hubungi client" → "- [ ] hubungi client"

2. CONVERT TO NUMBERED ONLY if line is:
   - SEQUENTIAL STEPS in a procedure where ORDER matters
   - Instructions/recipe steps that MUST be done in sequence
   - NOT individual tasks, but steps in ONE process
   - **Examples that should stay numbered:**
     * "1. Panaskan oven 180°C" (recipe step 1)
     * "2. Campur tepung dan gula" (must be after step 1)
     * "3. Masukkan ke oven 20 menit" (must be after step 2)
   - **Counter-examples (should be checklist):**
     * "1. Olahraga" (independent task)
     * "2. Belajar coding" (independent task)

3. CONVERT TO BULLET if line is:
   - Unordered idea/concept (NOT actionable)
   - List of items/things without tasks
   - Features, characteristics, attributes
   - **Examples:**
     * "1. Warna merah" → "- Warna merah"
     * "2. Ukuran besar" → "- Ukuran besar"

4. KEEP ORIGINAL if:
   - Plain text/paragraph
   - Headers/titles (e.g., "Persiapan:", "Kesimpulan:")
   - Already in correct format

**DECISION TREE:**
- Is it something you DO/need to DO? → CHECKLIST
- Is it a sequential step where order matters? → NUMBERED
- Is it just information/attribute? → BULLET
- Is it a header/title? → KEEP

Return:
- "lineFormats": Array of objects, one per line with:
  * "originalLine": the input line
  * "suggestedFormat": "checklist" | "numbered" | "bullet" | "keep"
  * "convertedLine": the line in suggested format
  * "reason": why this format (be specific!)
- "reformattedContent": Full content with selective conversions applied

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
  "lineFormats": [],
  "reformattedContent": "",
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
              content: `Classify and analyze this content. 

For lists: Analyze EACH LINE and determine if it should be converted to checklist/numbered/bullet or kept as-is.

**KEY RULE: If line contains an ACTION/TASK (something to DO), it MUST be a checklist!**

Examples:
- "1. beli susu" → checklist (actionable task)
- "2. bikin fitur login" → checklist (actionable task)
- "3. Panaskan oven" in context of recipe → numbered (sequential step)
- "4. Warna merah" → bullet (just information)

For code: Find ALL issues and provide corrected version.

"""
${note}
"""

Return JSON:
{
  "category": "...",
  "confidence": 0.0-1.0,
  "lineFormats": [
    {
      "originalLine": "original text",
      "suggestedFormat": "checklist|numbered|bullet|keep",
      "convertedLine": "converted text",
      "reason": "brief explanation"
    }
  ],
  "reformattedContent": "full content with selective conversions applied (join all convertedLine)",
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
      console.log("Parsed LLM analysis result:", parsedResult);

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

      if (!Array.isArray(parsedResult.lineFormats)) {
        parsedResult.lineFormats = [];
      }

      if (!parsedResult.reformattedContent) {
        parsedResult.reformattedContent = note;
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
        lineFormats: [],
        reformattedContent: note,
        codeMetadata: null,
      };
    }
    return parsedResult;
  } catch (error) {
    console.error("Error in analyzingNotesWithLLM:", error);

    return {
      category: "lainnya",
      confidence: 0.1,
      lineFormats: [],
      reformattedContent: note || "",
      codeMetadata: null,
    };
  }
};

module.exports = {
  analyzingNotesWithLLM,
};
