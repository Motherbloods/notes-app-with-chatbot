import { React, useState } from "react";
import { X, Check, AlertTriangle, CheckCircle2, Code2, RefreshCw, Loader2, FileText, Sparkles } from "lucide-react";
import useSmartTextarea from "../hooks/useSmartTextarea";

function EditModal({ onClose, onSave, initialData }) {
    const defaultData = initialData || {};

    const [category, setCategory] = useState(defaultData.category || "catatan");
    const [inputContent, setInputContent] = useState(defaultData.content || "");
    const [showSuggested, setShowSuggested] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [reanalyze, setReanalyze] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { textareaRef, handleKeyDown } = useSmartTextarea(inputContent, setInputContent);

    if (!initialData) return null;

    const isCode = defaultData.contentType === "code";
    const categoryChanged = category !== defaultData.category;
    const hasOriginalContent = defaultData.originalContent && defaultData.originalContent !== defaultData.content;
    const hasSuggestedCode = defaultData.suggestedCode && defaultData.suggestedCode !== defaultData.content;

    const handleSave = async () => {
        setIsSaving(true);
        try {
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
            await onSave(updatedNote);
        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">

                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Edit Catatan</h3>
                        <p className="text-sm text-gray-500 mt-1">Periksa dan sesuaikan sebelum menyimpan</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        disabled={isSaving}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Category Selection */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Kategori:</label>
                        <div className="mt-2">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={isSaving}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Reanalyze Checkbox for Code */}
                    {isCode && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="reanalyze"
                                checked={reanalyze}
                                onChange={(e) => setReanalyze(e.target.checked)}
                                disabled={isSaving}
                                className="w-4 h-4 text-blue-600 rounded disabled:opacity-50"
                            />
                            <label htmlFor="reanalyze" className="text-sm text-blue-800 flex items-center gap-2 cursor-pointer">
                                <RefreshCw size={14} />
                                <span>Analisis ulang kode ini untuk mendapatkan saran terbaru</span>
                            </label>
                        </div>
                    )}

                    {/* Code Metadata */}
                    {isCode && (
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

                            {/* Analysis Errors */}
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
                        </div>
                    )}

                    {/* Tabs for different views */}
                    <div className="border-b border-gray-200">
                        <div className="flex gap-1">
                            {/* Current/Edit Tab */}
                            <button
                                onClick={() => {
                                    setShowOriginal(false);
                                    setShowSuggested(false);
                                }}
                                disabled={isSaving}
                                className={`px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 rounded-t-lg ${!showOriginal && !showSuggested
                                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText size={16} />
                                    {isCode ? 'Current Code' : 'Current Content'}
                                </div>
                            </button>

                            {/* Original Content Tab */}
                            {hasOriginalContent && (
                                <button
                                    onClick={() => {
                                        setShowOriginal(true);
                                        setShowSuggested(false);
                                    }}
                                    disabled={isSaving}
                                    className={`px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 rounded-t-lg ${showOriginal
                                        ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} />
                                        Original
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Raw</span>
                                    </div>
                                </button>
                            )}

                            {/* Suggested Code Tab (only for code) */}
                            {isCode && hasSuggestedCode && (
                                <button
                                    onClick={() => {
                                        setShowOriginal(false);
                                        setShowSuggested(true);
                                    }}
                                    disabled={isSaving}
                                    className={`px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 rounded-t-lg ${showSuggested
                                        ? 'text-green-600 bg-green-50 border-b-2 border-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} />
                                        AI Suggestion
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">Fixed</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Display Area */}
                    <div className="space-y-2">
                        {/* Info Banner */}
                        {showOriginal && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-2">
                                <FileText size={16} className="text-purple-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-purple-800">
                                    <span className="font-semibold">Original Content</span> - Ini adalah konten asli sebelum diformat oleh AI
                                </div>
                            </div>
                        )}

                        {showSuggested && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                                <Sparkles size={16} className="text-green-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-green-800">
                                    <span className="font-semibold">AI-Suggested Fix</span> - Kode yang sudah diperbaiki oleh AI
                                </div>
                            </div>
                        )}

                        {!showOriginal && !showSuggested && (
                            <label className="text-sm font-semibold text-gray-700 block">
                                {isCode ? 'Edit Code:' : 'Edit Content:'}
                            </label>
                        )}

                        {/* Textarea */}
                        <textarea
                            ref={showOriginal || showSuggested ? null : textareaRef}
                            value={
                                showOriginal
                                    ? initialData.originalContent
                                    : showSuggested
                                        ? initialData.suggestedCode
                                        : inputContent
                            }
                            onChange={showOriginal || showSuggested ? undefined : (e) => setInputContent(e.target.value)}
                            onKeyDown={showOriginal || showSuggested ? undefined : handleKeyDown}
                            readOnly={showOriginal || showSuggested || isSaving}
                            disabled={isSaving}
                            className={`w-full p-4 border rounded-lg text-sm max-h-96 overflow-auto resize-none
                                ${isCode ? 'font-mono text-gray-800' : 'text-gray-700'}
                                ${showOriginal
                                    ? 'bg-purple-50 border-purple-300 cursor-default'
                                    : showSuggested
                                        ? 'bg-green-50 border-green-300 cursor-default'
                                        : isSaving
                                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                            : 'bg-white border-gray-300 cursor-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            rows={14}
                        />

                        {/* Comparison Note */}
                        {hasOriginalContent && !showOriginal && !isCode && (
                            <p className="text-xs text-gray-500 italic">
                                💡 Tip: Konten ini sudah diformat otomatis. Klik tab "Original" untuk melihat versi aslinya.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Batalkan
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Simpan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditModal;