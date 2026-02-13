import React from "react";
import { Archive } from "lucide-react";

export default function ArchivedNotice({ notes }) {
    const archivedCount = notes.filter(n => n.archived).length;
    if (!archivedCount) return null;

    return (
        <div
            className="
        mb-4 p-3 
        bg-tertiary 
        border border-custom 
        rounded-lg 
        flex items-center gap-2 
        text-sm text-secondary
        transition-colors
      "
        >
            <Archive size={16} />
            <span>{archivedCount} catatan diarsipkan (lebih dari 7 hari)</span>
        </div>
    );
}
