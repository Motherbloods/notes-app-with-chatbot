import React, { useEffect, useState } from "react";
import categories from "../config/categories";
import { useParams } from "react-router-dom";
import ArchivedNotice from "../components/Notes/ArchivedNotice";
import NotesList from "../components/Notes/NotesList";
import { deleteNoteById, getNotesByCategory, updateNote } from "../api/notes";
import { isThisMonth, isThisWeek, isToday } from "../config/date";
import ConfirmModal from "../components/ConfirmModal";
import EditModal from "../components/EditModal";
import { useNotes } from "../context/NotesContext";
import toast from "react-hot-toast";

function NotesPage() {
    const { decrementCounter, incrementCounter } = useNotes();
    const { categoryKey } = useParams();
    const [notes, setNotes] = useState([]);
    const [dateFilter, setDateFilter] = useState("all");
    const [customDate, setCustomDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
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

    const filteredNotes = notes.filter(note => {
        const noteDate = new Date(note.createdAt);

        if (dateFilter === "today") return isToday(note.createdAt);
        if (dateFilter === "week") return isThisWeek(note.createdAt);
        if (dateFilter === "month") return isThisMonth(note.createdAt);

        if (dateFilter === "custom-date" && customDate) {
            const selected = new Date(customDate);
            return (
                noteDate.getDate() === selected.getDate() &&
                noteDate.getMonth() === selected.getMonth() &&
                noteDate.getFullYear() === selected.getFullYear()
            );
        }

        if (dateFilter === "range" && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // supaya include full hari

            return noteDate >= start && noteDate <= end;
        }

        return true;
    });


    const archivedNotes = filteredNotes.filter(n => n.archived);

    const toggleChecklistItem = async (noteId, checklistIndex) => {
        try {
            const note = notes.find(n => n._id === noteId);
            if (!note) return;

            const lines = note.content.split('\n');
            let currentChecklistIndex = 0;

            const updatedLines = lines.map(line => {
                const checklistMatch = line.match(/^([-•*â€¢]?\s*)\[([ xX])\]\s*(.+)$/);

                if (checklistMatch) {
                    if (currentChecklistIndex === checklistIndex) {
                        const newCheckState = checklistMatch[2].toLowerCase() === 'x' ? ' ' : 'x';
                        currentChecklistIndex++;
                        return `- [${newCheckState}] ${checklistMatch[3]}`;
                    }
                    currentChecklistIndex++;
                }
                return line;
            });

            const updatedContent = updatedLines.join('\n');

            await updateNote(noteId, {
                content: updatedContent,
                reanalyze: false
            });

            setNotes(prevNotes =>
                prevNotes.map(n =>
                    (n._id === noteId)
                        ? { ...n, content: updatedContent }
                        : n
                )
            );

        } catch (error) {
            console.error("Error toggling checklist item:", error);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteNoteById(noteToDelete);
            setNotes(prevNotes => prevNotes.filter(n => n._id !== noteToDelete));
            setNoteToDelete(null);
            decrementCounter(category);
            toast.success("Berhasil Menghapus Note")
        } catch (error) {
            console.error("Error deleting note:", error);
            toast.error("⚠️ Gagal menghapus note. Silakan coba lagi.");
        }
    }

    const handleEditNote = async (updatedNote) => {
        try {
            const response = await updateNote(updatedNote._id, updatedNote);
            const savedNote = response.note;

            if (savedNote.category !== category) {
                setNotes(prevNotes =>
                    prevNotes.filter(n => n._id !== updatedNote._id)
                );

                // Update counter
                decrementCounter(category);
                incrementCounter(savedNote.category);
            } else {
                setNotes(prevNotes =>
                    prevNotes.map(n =>
                        n._id === updatedNote._id
                            ? { ...n, ...savedNote }
                            : n
                    )
                );
            }

            setSelectedNote(null);
        } catch (error) {
            console.error("Error updating note:", error);
        }
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {React.createElement(categories[category].icon, {
                        size: 28,
                        className: categories[category].color
                    })}
                    {categories[category].label}
                </h2>

                <div className="flex items-center gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="all">Semua</option>
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="custom-date">Pilih Tanggal</option>
                        <option value="range">Custom Range</option>
                    </select>

                    {dateFilter === "custom-date" && (
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        />
                    )}

                    {dateFilter === "range" && (
                        <>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm"
                            />
                            <span>-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm"
                            />
                        </>
                    )}
                </div>
            </div>



            <ArchivedNotice notes={archivedNotes} />

            <NotesList notes={filteredNotes} toggleChecklistItem={toggleChecklistItem} onDelete={setNoteToDelete} onSelectNote={setSelectedNote} onPinned={handleEditNote} />
            {noteToDelete && (
                <ConfirmModal
                    message="Yakin mau hapus catatan ini?"
                    onCancel={() => setNoteToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}

            {selectedNote && (
                <EditModal
                    onClose={() => { setSelectedNote(null) }}
                    onSave={handleEditNote}
                    initialData={selectedNote}
                />
            )}

        </>
    );
}

export default NotesPage;