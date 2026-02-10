import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, Loader2 } from "lucide-react";
import categories from "../config/categories";

const searchNotes = async (query) => {
    return [];
};

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const searchResults = await searchNotes(query);
                setResults(searchResults);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [query]);

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <Link
                    to="/notes/new"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Notes</span>
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Search Results
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {query ? `Searching for "${query}"` : "Enter a search query"}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <p className="mt-4 text-gray-600">Searching...</p>
                    </div>
                )}

                {!isLoading && query && results.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No results found
                        </h3>
                        <p className="text-gray-600">
                            Try different keywords
                        </p>
                    </div>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600 mb-3">
                            Found {results.length} result{results.length !== 1 ? 's' : ''}
                        </div>

                        {results.map((note) => {
                            const category = categories[note.category];
                            const Icon = category?.icon;

                            return (
                                <Link
                                    key={note.id}
                                    to={`/notes/${note.id}`}
                                    className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {note.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {note.content}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-gray-500">
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
                                </Link>
                            );
                        })}
                    </div>
                )}

                {!query && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Start searching
                        </h3>
                        <p className="text-gray-600">
                            Use the search bar in the sidebar to find your notes
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResults;