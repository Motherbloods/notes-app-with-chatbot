import { Search } from "lucide-react";

function SearchBar({ keyword, onChange, onKeyDown }) {
    return (
        <div className="relative">
            <Search
                className="absolute left-3 top-2.5 text-secondary"
                size={18}
            />

            <input
                type="text"
                placeholder="Search..."
                value={keyword}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                className="
          w-full pl-10 pr-4 py-2 
          bg-primary 
          text-primary 
          border border-custom 
          rounded-lg 
          focus:outline-none 
          focus:ring-2 
          focus:ring-[var(--color-blue)]
          transition-colors
        "
            />
        </div>
    );
}

export default SearchBar;
