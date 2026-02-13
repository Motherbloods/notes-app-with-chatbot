import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useNotes } from "../context/NotesContext";
import { Toaster } from "react-hot-toast";

function MainLayout() {
    const { notesCount } = useNotes();

    return (
        <div className="flex h-screen overflow-hidden bg-secondary text-primary">
            <Sidebar notesCount={notesCount} />

            <div className="flex-1 p-6 overflow-auto bg-primary">
                <Outlet />
            </div>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
}

export default MainLayout;