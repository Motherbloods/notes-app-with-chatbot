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

      const validCategories = [
        "target_harian",
        "ide",
        "kode",
        "catatan",
        "lainnya",
      ];
      if (!validCategories.includes(parsedResult.category)) {
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

      return parsedResult;
    } catch (parseError) {
      console.error("Failed to parse LLM response:", parseError);
      console.error("Raw response:", messageContent);

      return {
        category: "lainnya",
        confidence: 0.5,
        lineFormats: [],
        reformattedContent: note,
        codeMetadata: null,
      };
    }
  } catch (error) {
    console.error("Error in analyzingNotesWithLLM:", error);
    throw error;
  }
};

const generateTitleFromLLM = async (messageContent) => {
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
              content:
                "Generate a short, descriptive title (max 5 words) in Indonesian for this conversation. Return ONLY the title, no quotes or extra text.",
            },
            {
              role: "user",
              content: messageContent,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const title = data.choices[0].message.content
      .trim()
      .replace(/^["']|["']$/g, "");
    return title || "Chat Baru";
  } catch (error) {
    console.error("Error generating title:", error);
    return "Chat Baru";
  }
};

/**
 * NEW: Parse date/time from user message
 */
const parseDateFromMessage = (message) => {
  const now = new Date();
  const lowerMsg = message.toLowerCase();

  const monthNames = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  };

  const dayNames = {
    minggu: 0,
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6,
  };

  let targetDate = null;

  const dateMonthPattern =
    /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i;
  const match = lowerMsg.match(dateMonthPattern);

  if (match) {
    const day = parseInt(match[1]);
    const month = monthNames[match[2].toLowerCase()];
    const year = now.getFullYear();
    targetDate = new Date(year, month, day);

    console.log(
      `[DateParse] Found specific date: ${targetDate.toLocaleDateString("id-ID")}`,
    );
    return {
      type: "specific_date",
      date: targetDate,
      startDate: new Date(year, month, day, 0, 0, 0),
      endDate: new Date(year, month, day, 23, 59, 59),
    };
  }

  for (const [dayName, dayIndex] of Object.entries(dayNames)) {
    if (lowerMsg.includes(`hari ${dayName}`)) {
      const today = now.getDay();
      let daysAgo = (today - dayIndex + 7) % 7;
      if (daysAgo === 0) daysAgo = 0; // Today

      targetDate = new Date(now);
      targetDate.setDate(now.getDate() - daysAgo);

      console.log(
        `[DateParse] Found day name: ${dayName}, daysAgo: ${daysAgo}, date: ${targetDate.toLocaleDateString("id-ID")}`,
      );
      return {
        type: "day_of_week",
        date: targetDate,
        startDate: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          0,
          0,
          0,
        ),
        endDate: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          23,
          59,
          59,
        ),
      };
    }
  }

  if (lowerMsg.includes("kemarin")) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() - 1);

    console.log(
      `[DateParse] Found "kemarin": ${targetDate.toLocaleDateString("id-ID")}`,
    );
    return {
      type: "relative",
      date: targetDate,
      startDate: new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        0,
        0,
        0,
      ),
      endDate: new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        23,
        59,
        59,
      ),
    };
  }

  if (lowerMsg.includes("hari ini") || lowerMsg.includes("sekarang")) {
    console.log(
      `[DateParse] Found "hari ini": ${now.toLocaleDateString("id-ID")}`,
    );
    return {
      type: "today",
      date: now,
      startDate: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      ),
      endDate: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
      ),
    };
  }

  if (lowerMsg.includes("minggu ini")) {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    console.log(
      `[DateParse] Found "minggu ini": ${startOfWeek.toLocaleDateString("id-ID")} - ${endOfWeek.toLocaleDateString("id-ID")}`,
    );
    return {
      type: "week",
      date: now,
      startDate: new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate(),
        0,
        0,
        0,
      ),
      endDate: new Date(
        endOfWeek.getFullYear(),
        endOfWeek.getMonth(),
        endOfWeek.getDate(),
        23,
        59,
        59,
      ),
    };
  }

  if (lowerMsg.includes("bulan ini")) {
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    console.log(
      `[DateParse] Found "bulan ini": ${startOfMonth.toLocaleDateString("id-ID")} - ${endOfMonth.toLocaleDateString("id-ID")}`,
    );
    return {
      type: "month",
      date: now,
      startDate: startOfMonth,
      endDate: endOfMonth,
    };
  }

  return null;
};

/**
 * NEW: Search notes by date range
 */
const searchNotesByDate = (notes, dateInfo) => {
  if (!dateInfo) return [];

  const { startDate, endDate } = dateInfo;

  const filteredNotes = notes.filter((note) => {
    const noteDate = new Date(note.createdAt);
    return noteDate >= startDate && noteDate <= endDate;
  });

  console.log(
    `[DateSearch] Found ${filteredNotes.length} notes between ${startDate.toLocaleDateString("id-ID")} and ${endDate.toLocaleDateString("id-ID")}`,
  );

  return filteredNotes.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
};

/**
 * Extract relevant keywords from user message
 */
const extractKeywords = (message) => {
  const commonWords = [
    "apa",
    "yang",
    "saya",
    "ingin",
    "mau",
    "pengen",
    "sudah",
    "belum",
    "terakhir",
    "setelah",
    "untuk",
    "dan",
    "atau",
    "dari",
    "ke",
    "di",
    "dengan",
    "hari",
    "tanggal",
    "ada",
    "aja",
    "ya",
    "dong",
    "catatan",
    "notes",
    "note",
    "apakah",
    "terkait",
    "tentang",
    "mengandung",
    "kata",
    "carikan",
    "cari",
    "cek",
    "lihat",
    "tampilkan",
    "kasih",
    "berisi",
    "punya",
    "ada",
    "adalah",
    "ini",
    "itu",
    "tersebut",
    "lagi",
    "dulu",
    "kan",
  ];

  const patterns = [
    /(?:terkait|tentang|mengenai|mengandung kata)\s+(\w+)/gi,
    /(?:catatan|notes?)\s+(?:yang\s+)?(?:berisi|punya|ada)\s+(\w+)/gi,
    /carikan?\s+.*?(\w{4,})/gi, // Extract meaningful words after "cari"
  ];

  let extractedKeywords = [];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      if (
        match[1] &&
        match[1].length > 2 &&
        !commonWords.includes(match[1].toLowerCase())
      ) {
        extractedKeywords.push(match[1].toLowerCase());
      }
    }
  });

  if (extractedKeywords.length === 0) {
    const words = message
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => {
        const cleanWord = word.replace(/[.,!?;:"'()]/g, "");
        return cleanWord.length > 2 && !commonWords.includes(cleanWord);
      });

    extractedKeywords = words;
  }

  return [...new Set(extractedKeywords)];
};

/**
 * Search notes by keywords with relevance scoring
 */
const searchNotesByKeywords = (notes, keywords) => {
  if (keywords.length === 0) return [];

  const scoredNotes = notes.map((note) => {
    const content = note.content.toLowerCase();
    let score = 0;

    keywords.forEach((keyword) => {
      const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "gi");
      const matches = content.match(regex);
      if (matches) {
        score += matches.length * 10;
      }
      if (content.includes(keyword)) {
        score += 5;
      }
    });

    return { note, score };
  });

  return scoredNotes
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.note);
};

/**
 * Prepare notes context with smart search (keyword + temporal)
 */
const prepareNotesContext = (notes, userMessage = "") => {
  try {
    const sortedNotes = [...notes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    const categorizedNotes = {
      target_harian: [],
      ide: [],
      kode: [],
      catatan: [],
      lainnya: [],
    };

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

      if (note.content) {
        const lines = note.content.split("\n");
        lines.forEach((line) => {
          if (line.trim().startsWith("- [x]")) {
            const match = line.match(/<!--completed:(.*?)-->/);

            if (match) {
              const completedAt = new Date(match[1]);

              todoItems.completed.push({
                task: line
                  .replace("- [x]", "")
                  .replace(/<!--completed:.*?-->/, "")
                  .trim(),
                completedAt,
                noteId: note._id,
                noteCreatedAt: note.createdAt, // for reference
              });
            }
          }
        });
      }
    });

    const dateInfo = parseDateFromMessage(userMessage);
    let dateFilteredNotes = [];

    if (dateInfo) {
      dateFilteredNotes = searchNotesByDate(sortedNotes, dateInfo);
    }

    let relevantNotes = [];
    if (userMessage) {
      const keywords = extractKeywords(userMessage);
      console.log(
        `[ChatBot] Extracted keywords from "${userMessage}": [${keywords.join(", ")}]`,
      );

      if (keywords.length > 0) {
        relevantNotes = searchNotesByKeywords(sortedNotes, keywords);
        console.log(
          `[ChatBot] Found ${relevantNotes.length} relevant notes for keywords: ${keywords.join(", ")}`,
        );

        if (relevantNotes.length > 0) {
          console.log(
            `[ChatBot] Top relevant note: ${relevantNotes[0].content.substring(0, 100)}...`,
          );
        } else {
          console.log(
            `[ChatBot] WARNING: No relevant notes found despite having ${sortedNotes.length} total notes`,
          );
        }
      } else {
        console.log(`[ChatBot] WARNING: No keywords extracted from message`);
      }
    }

    todoItems.completed.sort(
      (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
    );

    return {
      totalNotes: sortedNotes.length,
      categorizedNotes,
      todoItems,
      recentNotes: sortedNotes.slice(0, 5),
      relevantNotes: relevantNotes.slice(0, 10),
      dateFilteredNotes: dateFilteredNotes,
      dateInfo: dateInfo,
      lastActivity: sortedNotes[0]?.createdAt || null,
    };
  } catch (error) {
    console.error("Error in prepareNotesContext:", error);
    return {
      totalNotes: 0,
      categorizedNotes: {},
      todoItems: { completed: [], pending: [] },
      recentNotes: [],
      relevantNotes: [],
      dateFilteredNotes: [],
      dateInfo: null,
      lastActivity: null,
    };
  }
};

/**
 * Generate bot response with improved notes context (keyword + temporal)
 */
const generateBotResponse = async (
  userMessage,
  conversationHistory = [],
  allNotes = [],
) => {
  console.log("ini allnotes", allNotes);
  try {
    const apikey = process.env.OPENROUTER_API_KEY;
    const notesContext = prepareNotesContext(allNotes, userMessage);

    const messages = [
      {
        role: "system",
        content: `Anda adalah asisten notes yang cerdas dan membantu. Anda membantu user mengelola berbagai jenis catatan dan dapat menjawab pertanyaan tentang riwayat notes mereka.

**NOTES CONTEXT AVAILABLE:**
- Total notes: ${notesContext.totalNotes}
- Completed tasks: ${notesContext.todoItems.completed.length}
- Pending tasks: ${notesContext.todoItems.pending.length}
- Last activity: ${notesContext.lastActivity ? new Date(notesContext.lastActivity).toLocaleString("id-ID") : "N/A"}

**ANSWERING QUESTIONS:**
User dapat bertanya:
- "Saya terakhir ngerjain apa?" → recent notes
- "Tanggal 9 februari saya ngerjain apa?" → notes by date
- "Hari jumat ada apa aja?" → notes by day
- "Setelah saya selesai X, apa yang ingin saya lakukan?" → relevant notes

Ketika menjawab:
1. PRIORITASKAN notes yang filtered by date jika user menanyakan tanggal/hari tertentu
2. Gunakan notes yang relevan dengan keyword jika tidak ada temporal filter
3. Berikan jawaban spesifik dan sebutkan tanggal/waktu
4. Jika tidak menemukan informasi, katakan dengan jelas

**FORMATTING:**
- Gunakan - [ ] untuk tasks
- Gunakan - untuk bullet points
- Gunakan 1. 2. 3. untuk sequential steps

**TONE:**
- Ramah, bahasa Indonesia natural, singkat tapi informatif

**IMPORTANT:**
- ALWAYS respond in Indonesian
- PRIORITIZE date-filtered notes when user asks about specific dates/days
ATURAN PENTING:
1. **FUZZY MATCHING**: Jika user nanya dengan typo/salah ketik, tetap cari yang relevan
   Contoh: "zerocloduflare" = "cloudflare" atau "zerocloudflare"
           "dokcer" = "docker"
           "nood" = "node"
   
2. **SEMANTIC SEARCH**: Cari berdasarkan topik/makna, bukan cuma exact match
   Contoh: "deploy aplikasi" → cari notes tentang deployment, docker, hosting
           "autentikasi" → cari notes tentang login, auth, middleware
   
3. **ALWAYS SEARCH NOTES**: Setiap kali user tanya tentang catatan mereka, SELALU cek notes dulu
   Jangan langsung bilang "tidak ada" tanpa cek similarity

4. **FORMAT JAWABAN**:
   - Kalau ketemu: Kasih ringkasan + kutip bagian relevan dari notes
   - Kalau ga ketemu: Bilang ga ada, tapi suggest keyword yang mungkin relevan

`,
      },
    ];

    messages.push(...conversationHistory.slice(-10));

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
      "setelah",
      "ingin",
      "mau",
      "pengen",
      "rencana",
      "tanggal",
      "hari",
      "kemarin",
      "minggu",
      "bulan",
    ];
    const isAskingAboutNotes = questionKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword),
    );

    if (allNotes.length > 0) {
      let contextMessage = `CONTEXT DATA - User's Notes:`;

      if (notesContext.dateInfo && notesContext.dateFilteredNotes.length > 0) {
        const dateRange =
          notesContext.dateInfo.type === "specific_date"
            ? new Date(notesContext.dateInfo.date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : `${new Date(notesContext.dateInfo.startDate).toLocaleDateString("id-ID")} - ${new Date(notesContext.dateInfo.endDate).toLocaleDateString("id-ID")}`;

        contextMessage += `

**Notes Pada ${dateRange} (${notesContext.dateFilteredNotes.length} notes):**
${notesContext.dateFilteredNotes
  .map(
    (note, i) => `
${i + 1}. [${note.category}] - ${new Date(note.createdAt).toLocaleString("id-ID")}
${note.content.substring(0, 400)}${note.content.length > 400 ? "..." : ""}
`,
  )
  .join("\n")}`;
      }

      if (notesContext.relevantNotes.length > 0 && !notesContext.dateInfo) {
        contextMessage += `

**Notes Yang Relevan:**
${notesContext.relevantNotes
  .map(
    (note, i) => `
${i + 1}. [${note.category}] - ${new Date(note.createdAt).toLocaleString("id-ID")}
${note.content.substring(0, 300)}${note.content.length > 300 ? "..." : ""}
`,
  )
  .join("\n")}`;
      }

      if (!notesContext.dateInfo && notesContext.relevantNotes.length === 0) {
        contextMessage += `

**5 Notes Terbaru:**
${notesContext.recentNotes
  .map(
    (note, i) => `
${i + 1}. [${note.category}] - ${new Date(note.createdAt).toLocaleString("id-ID")}
${note.content.substring(0, 200)}${note.content.length > 200 ? "..." : ""}
`,
  )
  .join("\n")}`;
      }

      if (notesContext.todoItems.completed.length > 0) {
        contextMessage += `

**COMPLETED TASKS (sorted by completion time, newest first):**
${notesContext.todoItems.completed
  .slice(0, 10) // Top 10 most recent
  .map(
    (task, i) => `
${i + 1}. "${task.task}"
   Completed: ${new Date(task.completedAt).toLocaleString("id-ID", {
     weekday: "long",
     year: "numeric",
     month: "long",
     day: "numeric",
     hour: "2-digit",
     minute: "2-digit",
     second: "2-digit",
   })}
   Note ID: ${task.noteId}
`,
  )
  .join("\n")}`;
      }

      contextMessage += `

**PENTING:** 
- PRIORITASKAN notes yang difilter berdasarkan tanggal
- Berikan jawaban spesifik berdasarkan content notes
- Sebutkan tanggal pembuatan note untuk konteks temporal
- **UNTUK "terakhir centang/selesai apa": GUNAKAN completed tasks list di atas, task NOMOR 1 adalah yang paling baru!**
- Completed tasks SUDAH TERSORTIR by completedAt (descending), jadi yang paling atas = paling baru`;

      messages.push({
        role: "system",
        content: contextMessage,
      });
    }

    messages.push({
      role: "user",
      content: userMessage,
    });

    console.log("[ChatBot] Sending request to LLM with context...");

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

    console.log("[ChatBot] Bot response generated successfully");
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
  prepareNotesContext,
};
