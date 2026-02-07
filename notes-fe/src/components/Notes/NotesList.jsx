import React from "react";
import NoteCard from "./NoteCard";

export default function NotesList({ notes, toggleChecklistItem }) {
    if (!notes || notes.length === 0) {
        return <p className="text-gray-400 text-center py-12">Belum ada catatan di kategori ini</p>;
    }

    return (
        <div className="space-y-4 max-h-[90vh] overflow-y-auto pr-2">
            {[...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(note => (
                <NoteCard key={note.id} note={note} toggleChecklistItem={toggleChecklistItem} />
            ))}
        </div>
    );
}
