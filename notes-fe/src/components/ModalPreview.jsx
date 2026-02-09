import React, { useState } from "react";
import { X, Check, AlertTriangle, CheckCircle2, Code2 } from "lucide-react";

function ModalPreview({
    isOpen,
    onClose,
    inputContent,
    category,
    confidence,
    errors,
    codeMetadata,
    lineFormats,
    onCategoryChange,
    onSave,
}) {
    const [showSuggested, setShowSuggested] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">

                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Konfirmasi Penyimpanan</h3>
                        <p className="text-sm text-gray-500 mt-1">Review hasil analisis AI sebelum menyimpan</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Kategori Terdeteksi:</label>
                        <div className="mt-2">
                            <select
                                value={category}
                                onChange={(e) => onCategoryChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="target_harian">📅 Target Harian</option>
                                <option value="ide">💡 Ide</option>
                                <option value="kode">💻 Kode</option>
                                <option value="catatan">📝 Catatan</option>
                            </select>
                        </div>
                    </div>

                    {codeMetadata ? (
                        <div className="space-y-4">
                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Bahasa:</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                        {codeMetadata.language}
                                    </span>
                                </div>
                                {confidence && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Confidence:</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                            {Math.round(confidence * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {codeMetadata.fileContext && (
                                <div className="text-sm">
                                    <span className="font-semibold">Konteks:</span>
                                    <span className="ml-2 text-gray-600">{codeMetadata.fileContext}</span>
                                </div>
                            )}

                            {codeMetadata.errors?.length > 0 && (
                                <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-orange-700 font-semibold mb-3">
                                        <AlertTriangle size={18} />
                                        <span>{codeMetadata.errors.length} Issue{codeMetadata.errors.length > 1 ? 's' : ''} Found</span>
                                    </div>
                                    <div className="space-y-3">
                                        {codeMetadata.errors.map((err, i) => (
                                            <div key={i} className="bg-white rounded p-3 border border-orange-200">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${err.type === 'error' ? 'bg-red-100 text-red-700' :
                                                        err.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {err.type}
                                                    </span>
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

                            {codeMetadata.suggested && codeMetadata.suggested !== codeMetadata.formatted && (
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
                                    {showSuggested ? '✅ Corrected Code:' : 'Preview:'}
                                </label>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 font-mono leading-relaxed">
                                    {showSuggested && codeMetadata.suggested
                                        ? codeMetadata.suggested
                                        : codeMetadata.formatted}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lineFormats && lineFormats.length > 0 && (
                                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                                        <CheckCircle2 size={18} />
                                        <span>AI Format Suggestions Applied ✨</span>
                                    </div>
                                    <p className="text-xs text-blue-600 mb-3">
                                        {lineFormats.filter(f => f.suggestedFormat !== 'keep').length} line(s) converted to better format
                                    </p>
                                    <details className="cursor-pointer">
                                        <summary className="text-sm text-blue-700 font-medium hover:underline">
                                            Show conversion details
                                        </summary>
                                        <div className="mt-3 space-y-2">
                                            {lineFormats.map((lineFormat, i) => {
                                                if (lineFormat.suggestedFormat === 'keep') return null;
                                                return (
                                                    <div key={i} className="bg-white rounded p-3 border border-blue-200 text-xs">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded font-medium ${lineFormat.suggestedFormat === 'checklist' ? 'bg-green-100 text-green-700' :
                                                                lineFormat.suggestedFormat === 'numbered' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {lineFormat.suggestedFormat}
                                                            </span>
                                                        </div>
                                                        <div className="text-gray-500 line-through mb-1">{lineFormat.originalLine}</div>
                                                        <div className="text-gray-700 font-medium mb-1">{lineFormat.convertedLine}</div>
                                                        <div className="text-gray-600 italic">{lineFormat.reason}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </details>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    {lineFormats && lineFormats.length > 0 ? '✨ AI-Formatted Preview:' : 'Preview:'}
                                </label>
                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 max-h-64 overflow-auto whitespace-pre-wrap">
                                    {inputContent}
                                </div>
                                {lineFormats && lineFormats.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                        💡 Your original input will be saved for reference
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batalkan
                    </button>
                    <button
                        onClick={onSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Check size={18} />
                        {lineFormats && lineFormats.length > 0 ? 'Save with AI Format' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalPreview;