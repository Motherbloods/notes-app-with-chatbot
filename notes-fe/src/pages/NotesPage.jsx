import React, { useEffect, useState } from "react";
import categories from "../config/categories";
import { useParams } from "react-router-dom";
import ArchivedNotice from "../components/Notes/ArchivedNotice";
import NotesList from "../components/Notes/NotesList";
import { getNotesByCategory, updateNote } from "../api/notes";

function NotesPage() {
    const { categoryKey } = useParams();
    const [notes, setNotes] = useState([]);
    const category = categoryKey;

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await getNotesByCategory(category);
                setNotes(data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }

        }
        fetchNotes()
    }, [category]);

    if (!categories[category]) {
        return <p>Halaman tidak ditemukan</p>;
    }

    const filteredNotes = notes?.filter(n => n.category === category) || [];
    const archivedNotes = filteredNotes.filter(n => n.archived);

    const toggleChecklistItem = async (noteId, checklistIndex) => {
        try {
            const note = notes.find(n => n._id === noteId || n.id === noteId);
            if (!note) return;

            const lines = note.content.split('\n');
            let currentChecklistIndex = 0;

            const updatedLines = lines.map(line => {
                const checklistMatch = line.match(/^([-•]?\s*)\[([ xX])\]\s*(.+)$/);

                if (checklistMatch) {
                    if (currentChecklistIndex === checklistIndex) {
                        const newCheckState = checklistMatch[2].toLowerCase() === 'x' ? ' ' : 'x';
                        currentChecklistIndex++;
                        return `${checklistMatch[1]}[${newCheckState}] ${checklistMatch[3]}`;
                    }
                    currentChecklistIndex++;
                }
                return line;
            });

            const updatedContent = updatedLines.join('\n');

            await updateNote(noteId, { content: updatedContent });

            setNotes(prevNotes =>
                prevNotes.map(n =>
                    (n._id === noteId || n.id === noteId)
                        ? { ...n, content: updatedContent }
                        : n
                )
            );

        } catch (error) {
            console.error("Error toggling checklist item:", error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                {React.createElement(categories[category].icon, { size: 28, className: categories[category].color })}
                {categories[category].label}
            </h2>

            <ArchivedNotice notes={archivedNotes} />

            <NotesList notes={filteredNotes} toggleChecklistItem={toggleChecklistItem} />
        </div>
    );
}

export default NotesPage;