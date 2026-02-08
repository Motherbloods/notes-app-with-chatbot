import React, { useState } from "react";

function CodeWithTabs({ note }) {
    const [activeTab, setActiveTab] = useState("suggested");

    const suggestedCode = note.suggestedCode;
    const originalCode = note.content;

    return (
        <div className="space-y-2">
            <div className="flex border-b border-gray-300 mb-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab("suggested") }}
                    className={`px-4 py-2 font-medium ${activeTab === "suggested"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    Suggested Code
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab("original") }}
                    className={`px-4 py-2 font-medium ${activeTab === "original"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    Original Code
                </button>
            </div>

            {activeTab === "suggested" && (
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto max-h-64 font-mono leading-relaxed whitespace-pre">
                    {suggestedCode}
                </pre>
            )}

            {activeTab === "original" && (
                <pre className="bg-gray-800 text-gray-300 p-3 rounded text-xs overflow-auto max-h-64 font-mono leading-relaxed whitespace-pre">
                    {originalCode}
                </pre>
            )}
        </div>
    );
}

export default CodeWithTabs;
