import { createNotes } from "../api/notes";

export const saveNoteData = async (
  content,
  title,
  analysisResult,
  originalContent,
) => {
  const notesData = {
    content,
    title,
    contentType: analysisResult?.category === "kode" ? "code" : "text",
    category: analysisResult?.category ?? "ide",
    language: analysisResult?.codeMetadata?.language ?? null,
    suggestedCode: analysisResult?.codeMetadata?.suggested ?? null,
    analysis: {
      confidence: analysisResult?.confidence ?? 0,
      errors:
        analysisResult?.codeMetadata?.errors ?? analysisResult?.errors ?? [],
    },
    originalContent: originalContent || null,
    wasReformatted:
      originalContent &&
      originalContent.trim().toLowerCase() !== content.trim().toLowerCase(),
    lineFormats: analysisResult?.lineFormats || [],
    fileContext: analysisResult.codeMetadata?.fileContext || null,
  };

  return await createNotes(notesData);
};
