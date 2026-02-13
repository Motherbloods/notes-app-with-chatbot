import SearchBar from "./Search";
import {
    Save,
    MessageSquare
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import categories from "../config/categories";
import ThemeToggle from "./ThemeToggle";

function Sidebar({ notesCount }) {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const isNavigatingToNote = useRef(false);

    useEffect(() => {
        if (!location.pathname.startsWith('/search') && !location.state?.highlightId) {
            setSearchInput("");
            setDebouncedSearch("");
            isNavigatingToNote.current = false;
        }

        if (location.state?.highlightId) {
            isNavigatingToNote.current = true;
        }
    }, [location.pathname, location.state?.highlightId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (isNavigatingToNote.current) {
            return;
        }

        const trimmed = debouncedSearch.trim();

        if (trimmed) {
            const currentQuery = new URLSearchParams(location.search).get('q');
            if (location.pathname !== '/search' || currentQuery !== trimmed) {
                navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            }
        } else if (location.pathname.startsWith('/search')) {
            navigate('/notes/new');
        }
    }, [debouncedSearch, navigate, location.pathname, location.search]);

    const handleSearchKeyDown = useCallback((e) => {
        if (e.key === "Enter" && searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput)}&mode=semantic`);
        }
    }, [searchInput, navigate]);

    return (
        <div className="w-64 bg-primary border-r border-custom p-4 transition-colors">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">
                    Second Brain
                </h1>
                <ThemeToggle />
            </div>

            <NavLink
                to="/notes/new"
                className={({ isActive }) =>
                    `w-full flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition text-white
        ${isActive
                        ? "btn-primary"
                        : "btn-primary hover:opacity-90"
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
                    <p className="text-xs text-secondary mt-1 px-1">
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
                                `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition
              ${isActive
                                    ? "bg-tertiary text-primary"
                                    : "text-secondary hover:bg-secondary"
                                }`
                            }
                        >
                            <Icon size={20} className={color} />
                            <span className="flex-1 text-left">{label}</span>
                            <span className="text-xs bg-tertiary px-2 py-1 rounded-full">
                                {count}
                            </span>
                        </NavLink>
                    );
                })}

                <NavLink
                    to="/chatbot"
                    className={({ isActive }) =>
                        `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition
          ${isActive
                            ? "bg-tertiary text-primary"
                            : "text-secondary hover:bg-secondary"
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