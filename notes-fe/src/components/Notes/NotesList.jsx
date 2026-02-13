import React, { useMemo, useEffect, useRef } from "react";
import NoteCard from "./NoteCard";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

export default function NotesList({
    notes,
    toggleChecklistItem,
    onDelete,
    onSelectNote,
    onPinned,
    highlightId,
}) {
    const containerRef = useRef(null);
    const previousNotesOrder = useRef([]);
    const highlightRef = useRef(null);

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

    useEffect(() => {
        const currentOrder = sortedNotes.map(n => n._id).join(',');
        const previousOrder = previousNotesOrder.current.join(',');

        if (currentOrder !== previousOrder && previousOrder.length > 0) {
            const firstNoteChanged = sortedNotes[0]?._id !== previousNotesOrder.current[0];

            if (firstNoteChanged && containerRef.current && !highlightId) {
                containerRef.current.scrollTop = 0;
            }
        }

        previousNotesOrder.current = sortedNotes.map(n => n._id);
    }, [sortedNotes, highlightId]);

    useEffect(() => {
        if (highlightId && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }, [highlightId]);

    if (!sortedNotes.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-secondary transition-colors">
                <div className="text-5xl mb-4 opacity-40">📝</div>
                <p className="text-sm">
                    Belum ada catatan di kategori ini
                </p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="max-h-[90vh] overflow-y-auto pr-2"
            style={{ scrollBehavior: 'auto' }}
        >
            <LayoutGroup>
                <motion.div className="space-y-4 pb-8">
                    <AnimatePresence mode="popLayout">
                        {sortedNotes.map((note) => {
                            const isHighlighted = highlightId === note._id;
                            return (
                                <motion.div
                                    id={`note-${note._id}`}
                                    key={note._id}
                                    ref={isHighlighted ? highlightRef : null}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >

                                    <NoteCard
                                        note={note}
                                        toggleChecklistItem={toggleChecklistItem}
                                        onDelete={onDelete}
                                        onSelectNote={onSelectNote}
                                        onPinned={onPinned}
                                        isHighlighted={isHighlighted}
                                    />
                                </motion.div>);
                        })}
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup >
        </div >
    );
}
