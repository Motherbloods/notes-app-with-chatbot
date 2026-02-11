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

const generateTitleFromLLM = async (msg) => {
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
          max_tokens: 50,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `You are a title generator. Create a short, concise title (max 5 words) that summarizes the main topic or intent of the user's message. 

Rules:
- Keep it under 5 words
- Use Indonesian language
- Be specific and descriptive
- Don't use punctuation at the end
- Return ONLY the title, no quotes or extra text

Examples:
Input: "Bagaimana cara membuat REST API dengan Express.js?"
Output: Membuat REST API Express

Input: "Tolong buatkan daftar belanja untuk minggu ini"
Output: Daftar Belanja Mingguan

Input: "1. Belajar JavaScript\n2. Olahraga pagi\n3. Baca buku"
Output: Target Harian Produktif`,
            },
            {
              role: "user",
              content: msg,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const title = data.choices[0].message.content.trim();

    if (!title || title.length > 50) {
      return msg.substring(0, 30).trim() + (msg.length > 30 ? "..." : "");
    }

    return title;
  } catch (error) {
    console.error("Error in generateTitleFromLLM:", error);

    return msg.substring(0, 30).trim() + (msg.length > 30 ? "..." : "");
  }
};

/**
 * NEW FUNCTION: Prepare notes context for chatbot
 * Extracts relevant information from user's notes history
 */
const prepareNotesContext = (allNotes, limit = 20) => {
  try {
    // Sort by most recent first
    const sortedNotes = [...allNotes]
      .filter((note) => !note.deletedAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    // Categorize notes
    const categorizedNotes = {
      target_harian: [],
      ide: [],
      kode: [],
      catatan: [],
      lainnya: [],
    };

    // Extract checklist items status
    const todoItems = {
      completed: [],
      pending: [],
    };

    sortedNotes.forEach((note) => {
      const category = note.category || "lainnya";
      const noteData = {
        id: note._id,
        content: note.content,
        createdAt: note.createdAt,
        category: note.category,
      };

      categorizedNotes[category].push(noteData);

      // Extract checklist items
      if (note.content) {
        const lines = note.content.split("\n");
        lines.forEach((line) => {
          if (line.trim().startsWith("- [x]")) {
            todoItems.completed.push({
              task: line.replace("- [x]", "").trim(),
              completedAt: note.updatedAt,
              noteId: note._id,
            });
          } else if (line.trim().startsWith("- [ ]")) {
            todoItems.pending.push({
              task: line.replace("- [ ]", "").trim(),
              createdAt: note.createdAt,
              noteId: note._id,
            });
          }
        });
      }
    });

    return {
      totalNotes: sortedNotes.length,
      categorizedNotes,
      todoItems,
      recentNotes: sortedNotes.slice(0, 5), // Last 5 notes
      lastActivity: sortedNotes[0]?.createdAt || null,
    };
  } catch (error) {
    console.error("Error in prepareNotesContext:", error);
    return {
      totalNotes: 0,
      categorizedNotes: {},
      todoItems: { completed: [], pending: [] },
      recentNotes: [],
      lastActivity: null,
    };
  }
};

/**
 * ENHANCED: Generate bot response with notes context
 * Now can answer questions about user's notes history
 */
const generateBotResponse = async (
  userMessage,
  conversationHistory = [],
  allNotes = [],
) => {
  try {
    const apikey = process.env.OPENROUTER_API_KEY;

    // Prepare notes context
    const notesContext = prepareNotesContext(allNotes);

    const messages = [
      {
        role: "system",
        content: `Anda adalah asisten notes yang cerdas dan membantu. Anda membantu user mengelola berbagai jenis catatan dan dapat menjawab pertanyaan tentang riwayat notes mereka.

**NOTES CONTEXT AVAILABLE:**
Anda memiliki akses ke data notes user:
- Total notes: ${notesContext.totalNotes}
- Completed tasks: ${notesContext.todoItems.completed.length}
- Pending tasks: ${notesContext.todoItems.pending.length}
- Last activity: ${notesContext.lastActivity ? new Date(notesContext.lastActivity).toLocaleString("id-ID") : "N/A"}

**CATEGORIES & RESPONSE STYLE:**

1. **target_harian** (To-do lists, daily tasks, checklists):
   - Respond dengan motivasi dan tips produktivitas
   - Sarankan prioritas atau cara mengorganisir tasks
   - Gunakan format checklist (- [ ]) untuk actionable items
   - Tanyakan detail atau deadline jika perlu
   - Contoh: "Bagus! Saya sudah mencatat target harian kamu. Mana yang paling prioritas untuk hari ini?"

2. **ide** (Ideas, brainstorming, concepts):
   - Respond dengan eksplorasi ide lebih lanjut
   - Berikan pertanyaan untuk memperdalam ide
   - Sarankan langkah implementasi
   - Gunakan bullet points (-) untuk list ide
   - Contoh: "Ide menarik! Untuk fitur login ini, sudah kepikiran mau pakai JWT atau session-based authentication?"

3. **kode** (Programming code):
   - Respond dengan analisis teknis
   - Jelaskan apa yang code lakukan
   - Tunjukkan error atau improvement jika ada
   - Sarankan best practices
   - Gunakan code blocks dengan syntax highlighting
   - Contoh: "Code JavaScript-nya sudah bagus. Saya lihat ada potential error di line 3..."

4. **catatan** (Meeting notes, documentation):
   - Respond dengan ringkasan atau poin penting
   - Sarankan struktur yang lebih baik jika perlu
   - Tanyakan apakah ada action items yang perlu difollow-up
   - Gunakan numbered list (1. 2. 3.) untuk sequential steps
   - Contoh: "Oke, sudah saya catat. Dari meeting ini ada 3 action items yang perlu difollow-up..."

5. **lainnya** (General):
   - Respond sesuai konteks
   - Tawarkan bantuan spesifik
   - Adaptif terhadap kebutuhan user

**ANSWERING QUESTIONS ABOUT NOTES:**
User dapat bertanya tentang notes mereka, seperti:
- "Saya terakhir ngerjain apa?" → Lihat recent notes
- "Tugas apa yang belum selesai?" → Lihat pending tasks
- "Terakhir saya sudah menyelesaikan apa?" → Lihat completed tasks
- "Saya pengen beli apa?" → Cari dalam notes yang mengandung kata "beli"

Ketika menjawab pertanyaan ini:
1. Analisis notes context yang tersedia
2. Berikan jawaban yang spesifik dan relevan
3. Sebutkan tanggal/waktu jika relevan
4. Tawarkan untuk memberikan detail lebih lanjut

**FORMATTING RULES:**
- Gunakan Markdown formatting
- Gunakan - [ ] untuk tasks yang bisa diceklis
- Gunakan - untuk bullet points (ideas, features)
- Gunakan 1. 2. 3. untuk sequential steps
- Gunakan \`code\` untuk inline code
- Gunakan \`\`\`language untuk code blocks

**TONE:**
- Ramah dan supportif
- Bahasa Indonesia yang natural
- Singkat tapi informatif
- Proaktif memberikan saran

**IMPORTANT:**
- ALWAYS respond in Indonesian
- Be concise but helpful
- Ask clarifying questions when needed
- Provide actionable suggestions
- Use the notes context to give personalized responses`,
      },
    ];

    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add notes context as a system message if user is asking about their notes
    const questionKeywords = [
      "terakhir",
      "belum",
      "selesai",
      "ngerjain",
      "beli",
      "tugas",
      "target",
      "kerjaan",
      "todo",
      "sudah",
    ];
    const isAskingAboutNotes = questionKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword),
    );

    if (isAskingAboutNotes) {
      messages.push({
        role: "system",
        content: `CONTEXT DATA - Recent Notes:

**5 Notes Terbaru:**
${notesContext.recentNotes
  .map(
    (note, i) => `
${i + 1}. [${note.category}] - ${new Date(note.createdAt).toLocaleString("id-ID")}
${note.content.substring(0, 150)}${note.content.length > 150 ? "..." : ""}
`,
  )
  .join("\n")}

**Tugas Yang Belum Selesai (${notesContext.todoItems.pending.length}):**
${
  notesContext.todoItems.pending
    .slice(0, 10)
    .map(
      (item, i) => `
${i + 1}. ${item.task} (dibuat ${new Date(item.createdAt).toLocaleString("id-ID")})`,
    )
    .join("\n") || "Tidak ada tugas pending"
}

**Tugas Yang Sudah Selesai (${notesContext.todoItems.completed.length}):**
${
  notesContext.todoItems.completed
    .slice(0, 5)
    .map(
      (item, i) => `
${i + 1}. ${item.task} (selesai ${new Date(item.completedAt).toLocaleString("id-ID")})`,
    )
    .join("\n") || "Belum ada tugas yang selesai"
}

Gunakan informasi ini untuk menjawab pertanyaan user dengan spesifik dan akurat.`,
      });
    }

    messages.push({
      role: "user",
      content: userMessage,
    });

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
          max_tokens: 1500,
          temperature: 0.7,
          messages: messages,
        }),
      },
    );

    const data = await response.json();
    const botResponse = data.choices[0].message.content.trim();

    return botResponse;
  } catch (error) {
    console.error("Error in generateBotResponse:", error);

    return "Maaf, saya sedang mengalami kendala. Tapi catatan kamu sudah tersimpan dengan aman! 📝";
  }
};

module.exports = {
  analyzingNotesWithLLM,
  generateTitleFromLLM,
  generateBotResponse,
  prepareNotesContext, // Export the new helper function
};
