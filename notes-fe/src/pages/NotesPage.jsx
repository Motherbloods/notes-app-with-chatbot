import React from "react";
import categories from "../config/categories";
import { useParams } from "react-router-dom";
import ArchivedNotice from "../components/Notes/ArchivedNotice";
import NotesList from "../components/Notes/NotesList";

function NotesPage({ notes, toggleChecklistItem }) {
    const { categoryKey } = useParams();
    const category = categoryKey;

    if (!categories[category]) {
        return <p>Halaman tidak ditemukan</p>;
    }

    const filteredNotes = notes?.filter(n => n.category === category) || [];
    const archivedNotes = filteredNotes.filter(n => n.archived);

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