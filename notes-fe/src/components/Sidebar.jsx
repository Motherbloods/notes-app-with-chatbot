import SearchBar from "./Search";
import { Save, MessageSquare, Menu, X, LogOut, MoreVertical, Link2, Sun, Moon, Check } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import categories from "../config/categories";
import ThemeToggle from "./ThemeToggle";
import LinkAccountModal from "./LinkAccountModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Sidebar({ notesCount }) {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [linkingProvider, setLinkingProvider] = useState(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isNavigatingToNote = useRef(false);

    const { user, setUser, logout } = useAuth();
    const { isDark } = useTheme();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        if (
            !location.pathname.startsWith("/search") &&
            !location.state?.highlightId
        ) {
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
            const currentQuery = new URLSearchParams(location.search).get("q");
            if (location.pathname !== "/search" || currentQuery !== trimmed) {
                navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            }
        } else if (location.pathname.startsWith("/search")) {
            navigate("/notes/new");
        }
    }, [debouncedSearch, navigate, location.pathname, location.search]);

    const handleSearchKeyDown = useCallback(
        (e) => {
            if (e.key === "Enter" && searchInput.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchInput)}&mode=semantic`);
            }
        },
        [searchInput, navigate],
    );

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setMenuOpen(false);
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleLinkSuccess = (updatedUser) => {
        setUser(updatedUser);
        setLinkingProvider(null);
    };

    const providers = user?.providers || [];
    const hasGoogle = providers.includes("google");
    const hasTelegram = providers.includes("telegram");
    const allLinked = hasGoogle && hasTelegram;

    const getAvatarGradient = (username) => {
        const colors = [
            ["#f97316", "#ec4899"],
            ["#8b5cf6", "#06b6d4"],
            ["#10b981", "#3b82f6"],
            ["#f59e0b", "#ef4444"],
            ["#6366f1", "#a855f7"],
        ];
        const idx = username ? username.charCodeAt(0) % colors.length : 0;
        return colors[idx];
    };

    const [gradStart, gradEnd] = getAvatarGradient(user?.username);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Menu"
                className="fixed top-6 left-2 z-50 md:hidden p-2 bg-primary rounded-lg shadow"
            >
                <Menu size={24} />
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 md:hidden z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={`
                    fixed md:static top-0 left-0 h-full w-full md:w-64
                    bg-primary border-r border-custom p-4
                    transition-transform duration-300 z-50 flex flex-col
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-[23px] font-bold text-primary">Second Brain</h1>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Tutup"
                            className="md:hidden p-2 rounded-lg hover:bg-secondary transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <NavLink
                        to="/notes/new"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition text-white
                            ${isActive ? "btn-primary" : "btn-primary hover:opacity-90"}`
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
                        {Object.entries(categories).map(
                            ([key, { icon: Icon, label, color, link }]) => {
                                const count =
                                    notesCount.find((n) => n.category === key)?.count || 0;
                                return (
                                    <NavLink
                                        key={key}
                                        to={link}
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) =>
                                            `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition
                                            ${isActive ? "bg-tertiary text-primary" : "text-secondary hover:bg-secondary"}`
                                        }
                                    >
                                        <Icon size={20} className={color} />
                                        <span className="flex-1 text-left">{label}</span>
                                        <span className="text-xs text-primary bg-tertiary px-2 py-1 rounded-full">
                                            {count}
                                        </span>
                                    </NavLink>
                                );
                            },
                        )}

                        <NavLink
                            to="/chatbot"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition
                                ${isActive ? "bg-tertiary text-primary" : "text-secondary hover:bg-secondary"}`
                            }
                        >
                            <MessageSquare size={20} className="text-pink-500" />
                            <span className="flex-1 text-left">Chat AI</span>
                        </NavLink>
                    </div>
                </div>

                <div
                    className="mt-4 pt-4 border-t border-custom relative"
                    ref={menuRef}
                >
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors duration-200">
                        <div className="relative flex-shrink-0">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar.includes("googleusercontent.com")
                                        ? user.avatar.replace(/=s\d+-c/, "=s40-c")
                                        : user.avatar}
                                    alt={user?.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})` }}
                                >
                                    {user?.username?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary rounded-full" />
                        </div>

                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <span className="text-primary font-semibold text-sm truncate leading-tight">
                                {user?.username}
                            </span>
                            {(user?.firstName || user?.lastName) && (
                                <span className="text-secondary text-xs truncate leading-tight">
                                    {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${menuOpen ? "bg-tertiary text-primary" : "hover:bg-tertiary text-secondary"}`}
                            aria-label="More options"
                        >
                            <MoreVertical size={16} />
                        </button>
                    </div>

                    {menuOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-52 bg-primary border border-custom rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary transition-colors">
                                <div className="flex items-center gap-2.5 text-sm text-primary">
                                    {isDark
                                        ? <Moon size={15} className="text-blue-400" />
                                        : <Sun size={15} className="text-yellow-400" />
                                    }
                                    <span>Tema</span>
                                </div>
                                <ThemeToggle />
                            </div>

                            <div className="border-t border-custom my-1.5 mx-2" />

                            <div className="px-3 pb-1">
                                <p className="text-xs text-secondary font-medium px-1 pb-1.5 uppercase tracking-wide">
                                    Tautkan Akun
                                </p>

                                {!hasGoogle && (
                                    <button
                                        onClick={() => { setMenuOpen(false); setLinkingProvider("google"); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition text-left group"
                                    >
                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">G</span>
                                        <span className="text-primary">Tautkan Google</span>
                                        <Link2 size={13} className="ml-auto text-secondary" />
                                    </button>
                                )}

                                {!hasTelegram && (
                                    <button
                                        onClick={() => { setMenuOpen(false); setLinkingProvider("telegram"); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition text-left group"
                                    >
                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold flex-shrink-0 group-hover:bg-sky-500/20 transition-colors">TG</span>
                                        <span className="text-primary">Tautkan Telegram</span>
                                        <Link2 size={13} className="ml-auto text-secondary" />
                                    </button>
                                )}

                                {allLinked && (
                                    <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-green-500">
                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/10">
                                            <Check size={13} />
                                        </span>
                                        <span>Semua akun tertaut</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-custom my-1.5 mx-2" />

                            <div className="px-3">
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 transition text-left text-red-500 disabled:opacity-60"
                                >
                                    {isLoggingOut ? (
                                        <svg
                                            className="animate-spin h-4 w-4 text-red-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                    ) : (
                                        <LogOut size={15} className="shrink-0" />
                                    )}
                                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {linkingProvider && (
                <LinkAccountModal
                    provider={linkingProvider}
                    onClose={() => setLinkingProvider(null)}
                    onSuccess={handleLinkSuccess}
                />
            )}
        </>
    );
}

export default Sidebar;
