import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useNotes } from "../context/NotesContext";

function MainLayout() {
    const { notesCount } = useNotes();

    return (
        <div className="flex h-screen overflow-hidden bg-secondary text-primary">
            <Sidebar notesCount={notesCount} />

            <main className="flex-1 p-6 overflow-hidden bg-primary">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;