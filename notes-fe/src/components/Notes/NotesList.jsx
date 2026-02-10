import React, { useMemo } from "react";
import NoteCard from "./NoteCard";

export default function NotesList({
    notes,
    toggleChecklistItem,
    onDelete,
    onSelectNote,
    onPinned,
}) {
    const sortedNotes = useMemo(() => {
        if (!notes) return [];

        const pinned = notes
            .filter((note) => note.isPinned)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        const others = notes
            .filter((note) => !note.isPinned)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return [...pinned, ...others];
    }, [notes]);

    if (!sortedNotes.length) {
        return (
            <p className="text-gray-400 text-center py-12">
                Belum ada catatan di kategori ini
            </p>
        );
    }

    return (
        <div className="space-y-4 max-h-[90vh] overflow-y-auto pr-2">
            {sortedNotes.map((note) => (
                <NoteCard
                    key={note._id}
                    note={note}
                    toggleChecklistItem={toggleChecklistItem}
                    onDelete={onDelete}
                    onSelectNote={onSelectNote}
                    onPinned={onPinned}
                />
            ))}
        </div>
    );
}
