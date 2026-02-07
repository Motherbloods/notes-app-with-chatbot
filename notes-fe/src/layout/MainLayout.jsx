import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getCategoriesNotesCount } from "../api/notes";

function MainLayout() {
    const [search, setSearch] = useState("");
    const [notesCount, setNotesCount] = useState([]);

    useEffect(() => {
        const fetchCounter = async () => {
            try {
                const data = await getCategoriesNotesCount();
                setNotesCount(data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        }
        fetchCounter();
    }, []);

    return (<div className="flex h-screen overflow-hidden">
        <Sidebar notesCount={notesCount} search={search} onSearchChange={setSearch} />
        <div className="flex-1 p-4 overflow-hidden">
            <Outlet />
        </div>
    </div>);
}

export default MainLayout;