import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useNotes } from "../context/NotesContext";
import { Toaster } from "react-hot-toast";

function MainLayout() {
    const { notesCount } = useNotes();

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar notesCount={notesCount} />
            <div className="flex-1 p-4 overflow-hidden">
                <Outlet />
            </div>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
}

export default MainLayout;