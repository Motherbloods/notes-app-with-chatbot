import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
function CodeWithTabs({ note }) {
    const [activeTab, setActiveTab] = useState("suggested");
    const [copied, setCopied] = useState(false);

    const suggestedCode = note.suggestedCode;
    const originalCode = note.content;

    const currentCode =
        activeTab === "suggested" ? suggestedCode : originalCode;

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(currentCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
            toast.success("Code Berhasil Dicopy")
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex border-b border-custom mb-2">

                <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab("suggested") }}
                    className={`
          px-4 py-2 font-medium transition-colors
          ${activeTab === "suggested"
                            ? "border-b-2 border-(--color-blue) text-(--color-blue)"
                            : "text-secondary hover:text-primary"
                        }
        `}
                >
                    Suggested Code
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab("original") }}
                    className={`
          px-4 py-2 font-medium transition-colors
          ${activeTab === "original"
                            ? "border-b-2 border-(--color-blue) text-(--color-blue)"
                            : "text-secondary hover:text-primary"
                        }
        `}
                >
                    Original Code
                </button>
            </div>

            <div className="relative">
                <button
                    onClick={handleCopy}
                    className="
          absolute top-2 right-5
          p-1.5 rounded-md
          cursor-pointer
          bg-tertiary
          text-primary
          hover:bg-secondary
          transition-colors
        "
                    title="Copy code"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>

                <pre
                    className={`
          p-3 rounded text-xs overflow-auto max-h-64
          font-mono leading-relaxed whitespace-pre
          transition-colors
          ${activeTab === "suggested"
                            ? "bg-tertiary text-primary border border-custom"
                            : "bg-secondary text-primary border border-custom"
                        }
        `}
                >
                    {currentCode}
                </pre>
            </div>
        </div>
    );
}

export default CodeWithTabs;
