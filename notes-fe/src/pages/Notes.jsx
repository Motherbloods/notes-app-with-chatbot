import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import useSmartTextarea from "../hooks/useSmartTextarea";
import ModalPreview from "../components/ModalPreview";
import { analyzingNotes } from "../api/analyzing";
import { saveNoteData } from "../services/notesService";
import { useNotes } from "../context/NotesContext";
import toast from "react-hot-toast";

function Notes() {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [analysisResult, setAnalysisResult] = useState({ category: "ide" });
    const [inputContent, setInputContent] = useState("");
    const [cleanedContent, setCleanedContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { incrementCounter } = useNotes();

    const saveNote = async () => {
        const result = await saveNoteData(cleanedContent, analysisResult, originalContent);
        console.log("Simpan note:", result);
        setShowConfirmation(false);
        setInputContent("");
        setCleanedContent("");
        incrementCounter(analysisResult.category);
        toast.success('Berhasil Membuat Note')
    };

    const { textareaRef, handleKeyDown } = useSmartTextarea(inputContent, setInputContent);

    const cleanEmptyListItems = (content) => {
        const lines = content.split('\n');
        let numberedListCounter = 0;
        let inNumberedList = false;

        return lines
            .filter(line => {
                if (/^\d+\.\s*$/.test(line.trim())) return false;
                if (/^[-•*]\s*$/.test(line.trim())) return false;
                if (/^[-•*]?\s*\[([ x])\]\s*$/.test(line.trim())) return false;
                return true;
            })
            .map(line => {
                const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
                if (numberedMatch) {
                    inNumberedList = true;
                    numberedListCounter++;
                    return `${numberedListCounter}. ${numberedMatch[2]}`;
                } else {
                    if (inNumberedList && line.trim() !== '') {
                        inNumberedList = false;
                        numberedListCounter = 0;
                    }
                    return line;
                }
            })
            .join('\n')
            .trim();
    };
    const analyzeContent = async (content) => {
        if (!content.trim()) return;

        try {
            setIsAnalyzing(true);

            const cleaned = cleanEmptyListItems(content);
            setOriginalContent(content);

            const result = await analyzingNotes({ content: cleaned });

            const data = result?.data || {};

            const reformattedContent = data.reformattedContent ?? cleaned;

            setCleanedContent(reformattedContent);

            setAnalysisResult({
                category: data.category ?? "ide",
                confidence: data.confidence ?? 0,
                errors: data.errors ?? [],
                codeMetadata: data.codeMetadata ?? null,
                lineFormats: data.lineFormats ?? [],
                reformattedContent,
            });

            console.log("Hasil analisis:", data);

            setShowConfirmation(true);

        } catch (error) {
            console.error("Gagal analyze:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return <div className="flex-1 p-8 bg-primary text-primary">
        <h2 className="text-2xl font-bold mb-2">Paste Anything Here</h2>
        <p className="text-sm text-secondary mb-4">
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
            className=" w-full h-96 p-4 bg-secondary resize-none border border-primary rounded-xl text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-secondary
      "/>
        <button
            onClick={() => analyzeContent(inputContent)}
            disabled={!inputContent.trim() || isAnalyzing}
            className="
mt-4 px-6 py-3 
btn-primary
text-white 
rounded-xl 
hover:opacity-90 
disabled:opacity-50 
disabled:cursor-not-allowed 
transition 
flex items-center gap-2
"
        >
            {isAnalyzing ? (
                <>
                    <Loader2 size={20} className="animate-spin text-white" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Save size={20} className="text-white" />
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
            lineFormats={analysisResult.lineFormats}
            onCategoryChange={(cat) =>
                setAnalysisResult((prev) => ({ ...prev, category: cat }))
            }
            onSave={saveNote}
        />

    </div>
}

export default Notes;