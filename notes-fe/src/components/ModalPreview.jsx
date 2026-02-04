import React from "react";
import { X, Check, AlertTriangle } from "lucide-react";


function ModalPreview({ isOpen, onClose, inputContent, analysisResult, onSave }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Konfirmasi Penyimpanan</h3>
                        <p className="text-sm text-gray-500 mt-1">Review hasil analisis AI sebelum menyimpan</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Kategori */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Kategori Terdeteksi:</label>
                        <div className="mt-2">
                            <select
                                value={analysisResult.category}
                                onChange={(e) => analysisResult.setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="target_harian">📅 Target Harian</option>
                                <option value="ide">💡 Ide</option>
                                <option value="kode">💻 Kode</option>
                                <option value="catatan">📝 Catatan</option>
                            </select>
                        </div>
                    </div>

                    {/* Preview kode */}
                    {analysisResult.codeMetadata ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">Bahasa:</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{analysisResult.codeMetadata.language}</span>
                            </div>

                            {analysisResult.codeMetadata.fileContext && (
                                <div className="text-sm">
                                    <span className="font-semibold">Konteks:</span>
                                    <span className="ml-2 text-gray-600">{analysisResult.codeMetadata.fileContext}</span>
                                </div>
                            )}

                            {analysisResult.codeMetadata.errors?.length > 0 && (
                                <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                                        <AlertTriangle size={18} />
                                        <span>{analysisResult.codeMetadata.errors.length} Potential Issues</span>
                                    </div>
                                    <div className="space-y-2">
                                        {analysisResult.codeMetadata.errors.map((err, i) => (
                                            <div key={i} className="text-sm text-orange-800">
                                                • Line {err.line}: {err.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysisResult.codeMetadata.formatted && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Preview Formatted:</label>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64 font-mono">
                                        {analysisResult.codeMetadata.formatted}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Preview:</label>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 max-h-48 overflow-auto whitespace-pre-wrap">
                                {inputContent}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Batalkan
                    </button>
                    <button
                        onClick={onSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Check size={18} />
                        Simpan Tetap
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalPreview;