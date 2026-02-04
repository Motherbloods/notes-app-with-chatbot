import SearchBar from "./Search";
import {
    Calendar,
    Code2,
    FileText,
    Lightbulb,
    Save,
    MessageSquare
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ search, onSearchChange }) {
    const [notes] = useState([]);

    const categories = {
        target_harian: { icon: Calendar, label: "Target Harian", color: "text-blue-500", link: "/target_harian" },
        ide: { icon: Lightbulb, label: "Ide", color: "text-yellow-500", link: "/ide" },
        kode: { icon: Code2, label: "Kode", color: "text-green-500", link: "/kode" },
        catatan: { icon: FileText, label: "Catatan", color: "text-purple-500", link: "/catatan" }
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Second Brain</h1>

            <NavLink
                to="/notes/new"
                className={({ isActive }) =>
                    `w-full flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition
     ${isActive
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`
                }
            >
                <Save size={20} />
                <span>New Note</span>
            </NavLink>


            <div className="mb-4">
                <SearchBar keyword={search} onChange={onSearchChange} />
            </div>

            <div className="space-y-1">
                {Object.entries(categories).map(([key, { icon: Icon, label, color, link }]) => {
                    const count = notes.filter(n => n.category === key).length;

                    return (
                        <NavLink
                            key={key}
                            to={link}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`
                            }
                        >
                            <Icon size={20} className={color} />
                            <span className="flex-1 text-left">{label}</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                                {count}
                            </span>
                        </NavLink>

                    );
                })}

                <NavLink to="/chatbot"
                    className={({ isActive }) =>
                        `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50"
                        }`
                    }
                >
                    <MessageSquare size={20} className="text-pink-500" />
                    <span className="flex-1 text-left">Chat AI</span>
                </NavLink>
            </div>
        </div>
    );
}

export default Sidebar;
