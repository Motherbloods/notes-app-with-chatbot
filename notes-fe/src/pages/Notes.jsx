import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import useSmartTextarea from "../hooks/useSmartTextarea";

function Notes() {
    const [inputContent, setInputContent] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { textareaRef, handleKeyDown } = useSmartTextarea(inputContent, setInputContent);

    const analyzeContent = async (content) => {
        setIsAnalyzing(true);
        setTimeout(() => {
            console.log("Analyzed content:", content);
            setIsAnalyzing(false);
        }, 1000);
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
                    Simpan & Analisis
                </>
            )}
        </button>
    </div>
}

export default Notes;
