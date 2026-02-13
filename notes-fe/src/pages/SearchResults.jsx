import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Loader2, Sparkles, Layers } from "lucide-react";

import categories from "../config/categories";
import { searchNotes } from "../api/search";

function SearchResults() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get("q") || "";
    const mode = searchParams.get("mode") || "hybrid";

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const performSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await searchNotes(query, mode);
            setResults(response || []);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        performSearch();
    }, [query, mode]);

    const noResults =
        query && results.length === 0 && !isLoading;

    const switchMode = (newMode) => {
        navigate(`/search?q=${encodeURIComponent(query)}&mode=${newMode}`);
    };

    const handleNoteClick = (note) => {
        navigate(`/notes/${note.category}`, {
            state: { highlightId: note._id },
            replace: false
        });
    };

    return (
        <div className="h-full flex flex-col bg-primary text-primary">
            <div className="mb-6">
                <Link
                    to="/notes/new"
                    className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-4 transition"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Notes</span>
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Search Results
                        </h1>

                        <p className="text-secondary mt-1">
                            {query
                                ? `Searching "${query}" (${mode})`
                                : "Enter a search query"}
                        </p>
                    </div>

                    {query && (
                        <div className="flex gap-2">
                            {mode !== "hybrid" && (
                                <button
                                    onClick={() => switchMode("hybrid")}
                                    className="btn-primary rounded-xl px-4 py-2 flex items-center gap-2"
                                >
                                    <Layers size={18} />
                                    <span>Hybrid</span>
                                </button>
                            )}

                            {mode !== "semantic" && (
                                <button
                                    onClick={() => switchMode("semantic")}
                                    className="btn-primary rounded-xl px-4 py-2 flex items-center gap-2"
                                >
                                    <Sparkles size={18} />
                                    <span>Semantic</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    {mode === "hybrid" && (
                        <div className="text-sm bg-tertiary text-secondary px-3 py-1 rounded-full inline-flex items-center gap-2">
                            <Layers size={14} />
                            Hybrid search (keyword + embedding)
                        </div>
                    )}

                    {mode === "semantic" && (
                        <div className="text-sm bg-tertiary text-secondary px-3 py-1 rounded-full inline-flex items-center gap-2">
                            <Sparkles size={14} />
                            Semantic AI search
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                        <p className="mt-4 text-secondary">
                            Searching...
                        </p>
                    </div>
                )}

                {!isLoading && noResults && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-secondary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No results found
                        </h3>
                        <p className="text-secondary">
                            Try switching search mode
                        </p>
                    </div>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="space-y-3">

                        <div className="text-sm text-secondary mb-3">
                            Found {results.length} result
                            {results.length !== 1 ? "s" : ""}
                        </div>

                        {results.map((note) => {
                            const category = categories[note.category];
                            const Icon = category?.icon;

                            return (
                                <div
                                    key={note._id}
                                    onClick={() => handleNoteClick(note)}
                                    className="
                  block p-4
                  bg-primary
                  border border-primary
                  rounded-xl
                  hover:shadow-md
                  hover:bg-secondary
                  transition
                  cursor-pointer
                "
                                >
                                    <div className="flex items-start justify-between mb-2">

                                        <h3 className="text-lg font-semibold flex-1">
                                            {note.title}
                                        </h3>

                                        {mode === "semantic" && note.similarity && (
                                            <span className="text-xs bg-tertiary text-secondary px-2 py-1 rounded ml-2">
                                                Score: {note.similarity.toFixed(2)}
                                            </span>
                                        )}

                                    </div>

                                    <p className="text-secondary text-sm mb-3 line-clamp-2">
                                        {note.content}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-secondary">

                                        {Icon && (
                                            <div className="flex items-center gap-1">
                                                <Icon size={14} className={category.color} />
                                                <span>{category.label}</span>
                                            </div>
                                        )}

                                        <span>
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!query && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-secondary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            Start searching
                        </h3>
                        <p className="text-secondary">
                            Use the search bar to find your notes
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResults;