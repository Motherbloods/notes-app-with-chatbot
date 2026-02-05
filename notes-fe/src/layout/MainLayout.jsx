import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

function MainLayout() {
    const [search, setSearch] = useState("");
    const [notes] = useState([]);
    return (<div className="flex h-screen overflow-hidden">
        <Sidebar notes={notes} search={search} onSearchChange={setSearch} />
        <div className="flex-1 p-4 overflow-hidden">
            <Outlet />
        </div>
    </div>);
}

export default MainLayout;