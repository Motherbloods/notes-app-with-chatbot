import SearchBar from "./Search";
import {
    Save,
    MessageSquare
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import categories from "../config/categories";

function Sidebar({ notesCount }) {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location.pathname.startsWith('/search')) {
            setSearchInput("");
            setDebouncedSearch("");
        }
    }, [location.pathname]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const trimmed = debouncedSearch.trim();

        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
        } else if (location.pathname.startsWith('/search')) {
            navigate('/notes/new');
        }
    }, [debouncedSearch, navigate, location.pathname]);

    const handleSearchKeyDown = useCallback((e) => {
        if (e.key === "Enter" && searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput)}&mode=semantic`);
        }
    }, [searchInput, navigate]);

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
                <SearchBar
                    keyword={searchInput}
                    onChange={setSearchInput}
                    onKeyDown={handleSearchKeyDown}
                />
                {searchInput && (
                    <p className="text-xs text-gray-500 mt-1 px-1">
                        Press Enter for AI search
                    </p>
                )}
            </div>

            <div className="space-y-1">
                {Object.entries(categories).map(([key, { icon: Icon, label, color, link }]) => {
                    const count = notesCount.find(n => n.category === key)?.count || 0;
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