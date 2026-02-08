import React from "react";
import { Code2, AlertTriangle, Trash2 } from "lucide-react";
import renderFormattedContent from "./renderFormattedContent";

export default function NoteCard({ note, toggleChecklistItem, onDelete }) {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString("id-ID")}
                </span>

                <button
                    onClick={() => onDelete(note._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Hapus catatan"
                >
                    <Trash2 size={16} />
                </button>
            </div>


            {note.category == "kode" && (
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Code2 size={16} className="text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">{note.language}</span>
                        {note.fileContext && (
                            <span className="text-xs text-gray-500">• {note.fileContext}</span>
                        )}
                    </div>
                    {note.analysisErrors?.length > 0 && (
                        <div className="mb-2 space-y-1">
                            {note.analysisErrors.map((err, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                    <span>Line {err.line}: {err.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {renderFormattedContent(note, toggleChecklistItem)}
        </div>
    );
}
