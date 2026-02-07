import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import useSmartTextarea from "../hooks/useSmartTextarea";
import ModalPreview from "../components/ModalPreview";
import { analyzingNotes } from "../api/analyzing";
import { saveNoteData } from "../services/notesService";
import { useNotes } from "../context/NotesContext";

function Notes() {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [analysisResult, setAnalysisResult] = useState({ category: "ide" });
    const [inputContent, setInputContent] = useState("");
    const [cleanedContent, setCleanedContent] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { incrementCounter } = useNotes();

    const saveNote = async () => {
        const result = await saveNoteData(cleanedContent, analysisResult);
        console.log("Simpan note:", result);
        setShowConfirmation(false);
        setInputContent("");
        setCleanedContent("");
        incrementCounter(analysisResult.category);
    };

    const { textareaRef, handleKeyDown } = useSmartTextarea(inputContent, setInputContent);

    const cleanEmptyListItems = (content) => {
        return content
            .split('\n')
            .filter(line => {
                if (/^\d+\.\s*$/.test(line.trim())) {
                    return false;
                }
                if (/^[-•*]\s*$/.test(line.trim())) {
                    return false;
                }
                if (/^[-•*]?\s*\[([ x])\]\s*$/.test(line.trim())) {
                    return false;
                }
                return true;
            })
            .join('\n')
            .trim();
    };

    const analyzeContent = async (content) => {
        setIsAnalyzing(true);
        const cleaned = cleanEmptyListItems(content);
        setCleanedContent(cleaned);
        const result = await analyzingNotes({ content: cleaned });
        console.log("Hasil analisis:", result);
        setAnalysisResult({
            category: result.data?.category || "ide",
            confidence: result.data?.confidence,
            errors: result.data?.errors,
            codeMetadata: result.data?.codeMetadata
        });
        setIsAnalyzing(false);
        setShowConfirmation(true)
    }

    return <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Paste Anything Here</h2>
        <p className="text-sm text-gray-500 mb-4">
            💡 Tips: Ketik "1. " untuk numbered list, "- " untuk bullet, "- [ ] " untuk checklist
        </p>
        <textarea
            ref={textareaRef}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste teks, kode, ide, atau target harian di sini...

Contoh list:
1. Item pertama
2. Item kedua

Contoh checklist:
- [ ] Task belum selesai
- [x] Task selesai"
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <button
            onClick={() => analyzeContent(inputContent)}
            disabled={!inputContent.trim() || isAnalyzing}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {isAnalyzing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Save size={20} />
                    Analisis
                </>
            )}
        </button>
        <ModalPreview
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            inputContent={cleanedContent}
            category={analysisResult.category}
            confidence={analysisResult.data?.confidence}
            errors={analysisResult.data?.errors}
            codeMetadata={analysisResult.codeMetadata}
            onCategoryChange={(cat) =>
                setAnalysisResult((prev) => ({ ...prev, category: cat }))
            }
            onSave={saveNote}
        />

    </div>
}

export default Notes;
