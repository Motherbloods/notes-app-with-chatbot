import React from "react";
import { Code2, AlertTriangle, Trash2, Pin } from "lucide-react";
import renderFormattedContent from "./renderFormattedContent";

export default function NoteCard({ note, toggleChecklistItem, onDelete, onSelectNote, onPinned, isHighlighted }) {

    return (
        <div
            className={`bg-white p-4 rounded-lg border shadow-sm
             hover:shadow-lg hover:-translate-y-1 transition-all transform duration-200 cursor-pointer
             ${isHighlighted
                    ? 'border-yellow-400 ring-4 ring-yellow-300 bg-yellow-50 shadow-xl'
                    : 'border-gray-200'
                }`}
            onClick={(e) => { e.stopPropagation(); onSelectNote(note) }}
        >

            <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString("id-ID")}
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPinned({ _id: note._id, isPinned: !note.isPinned });
                        }}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${note.isPinned
                            ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                            : "text-gray-400 hover:text-yellow-500 hover:bg-gray-100"
                            }`}
                        title={note.isPinned ? "Unpin Catatan" : "Pin Catatan"}
                    >
                        <Pin size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note._id);
                        }}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus catatan"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
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
