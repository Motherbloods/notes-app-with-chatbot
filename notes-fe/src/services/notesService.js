import { createNotes } from "../api/notes";

export const saveNoteData = async (content, analysisResult) => {
  const notesData = {
    content,
    contentType: analysisResult?.category === "kode" ? "code" : "text",
    category: analysisResult?.category ?? "ide",
    language: analysisResult?.codeMetadata?.language ?? null,
    suggestedCode: analysisResult?.codeMetadata?.suggested ?? null,
    analysis: {
      confidence: analysisResult?.confidence ?? 0,
      errors:
        analysisResult?.codeMetadata?.errors ?? analysisResult?.errors ?? [],
    },
  };

  return await createNotes(notesData);
};
