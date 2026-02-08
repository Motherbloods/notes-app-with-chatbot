import { React, useState } from "react";
import { X, Check, AlertTriangle, CheckCircle2, Code2, RefreshCw } from "lucide-react";

function EditModal({ onClose, onSave, initialData }) {
    const defaultData = initialData || {};

    const [category, setCategory] = useState(defaultData.category || "catatan");
    const [inputContent, setInputContent] = useState(defaultData.content || "");
    const [showSuggested, setShowSuggested] = useState(false);
    const [reanalyze, setReanalyze] = useState(false);

    if (!initialData) return null;

    const isCode = defaultData.contentType === "code";
    const categoryChanged = category !== defaultData.category;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">

                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Edit Catatan</h3>
                        <p className="text-sm text-gray-500 mt-1">Periksa dan sesuaikan sebelum menyimpan</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Kategori:</label>
                        <div className="mt-2">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="target_harian">📅 Target Harian</option>
                                <option value="ide">💡 Ide</option>
                                <option value="kode">💻 Kode</option>
                                <option value="catatan">📝 Catatan</option>
                            </select>
                        </div>
                        {categoryChanged && (
                            <p className="text-xs text-orange-600 mt-1">
                                ⚠️ Kategori berubah - catatan akan dianalisis ulang saat disimpan
                            </p>
                        )}
                    </div>

                    {isCode && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="reanalyze"
                                checked={reanalyze}
                                onChange={(e) => setReanalyze(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="reanalyze" className="text-sm text-blue-800 flex items-center gap-2 cursor-pointer">
                                <RefreshCw size={14} />
                                <span>Analisis ulang kode ini untuk mendapatkan saran terbaru</span>
                            </label>
                        </div>
                    )}

                    {isCode ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Bahasa:</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                        {initialData.language || "N/A"}
                                    </span>
                                </div>
                                {initialData.confidence && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Confidence:</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                            {Math.round(initialData.confidence * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {initialData.analysisErrors?.length > 0 && (
                                <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-orange-700 font-semibold mb-3">
                                        <AlertTriangle size={18} />
                                        <span>{initialData.analysisErrors.length} Issue{initialData.analysisErrors.length > 1 ? 's' : ''} Found</span>
                                    </div>
                                    <div className="space-y-3">
                                        {initialData.analysisErrors.map((err, i) => (
                                            <div key={i} className="bg-white rounded p-3 border border-orange-200">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${err.type === 'error' ? 'bg-red-100 text-red-700' :
                                                        err.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>{err.type}</span>
                                                    <span className="text-xs text-gray-500">Line {err.line}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 mb-2">{err.message}</p>
                                                {err.fix && (
                                                    <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                                                        <div className="flex items-center gap-1 text-xs text-green-700 font-medium mb-1">
                                                            <CheckCircle2 size={14} />
                                                            <span>Suggested fix:</span>
                                                        </div>
                                                        <code className="text-xs text-green-800 font-mono">{err.fix}</code>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {initialData.suggestedCode && initialData.suggestedCode !== initialData.content && (
                                <div className="flex gap-2 border-b border-gray-200">
                                    <button
                                        onClick={() => setShowSuggested(false)}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${!showSuggested
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Code2 size={16} />
                                            Original Code
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setShowSuggested(true)}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${showSuggested
                                            ? 'text-green-600 border-b-2 border-green-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={16} />
                                            Suggested Fix
                                        </div>
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    {showSuggested ? '✅ Suggested Code:' : 'Preview:'}
                                </label>
                                <textarea
                                    value={showSuggested ? initialData.suggestedCode : inputContent}
                                    onChange={showSuggested ? undefined : (e) => setInputContent(e.target.value)}
                                    readOnly={showSuggested}
                                    className={`w-full p-4 border border-gray-300 rounded-lg text-sm text-gray-700 max-h-96 overflow-auto font-mono resize-none 
            ${showSuggested ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-text'}`}
                                    rows={12}
                                />
                            </div>

                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Preview:</label>
                            <textarea
                                value={inputContent}
                                onChange={(e) => setInputContent(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg text-sm text-gray-700 max-h-64 overflow-auto resize-none"
                                rows={8}
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batalkan
                    </button>
                    <button
                        onClick={() => {
                            const updatedNote = {
                                _id: initialData._id,
                                category,
                                content: inputContent,
                                contentType: initialData.contentType,
                                ...(isCode && !reanalyze && !categoryChanged && {
                                    language: initialData.language,
                                    suggestedCode: initialData.suggestedCode,
                                    analysisErrors: initialData.analysisErrors,
                                    confidence: initialData.confidence,
                                }),
                                reanalyze: reanalyze || categoryChanged,
                            };
                            onSave(updatedNote);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Check size={18} />
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditModal;