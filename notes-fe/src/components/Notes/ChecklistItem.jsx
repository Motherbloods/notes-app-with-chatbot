import { useState } from "react";

function ChecklistItem({ noteId, text, state, index, toggleChecklistItem }) {
  const [hovered, setHovered] = useState(false);

  const isDone = state === "done";
  const isFailed = state === "failed";
  const isActive = isDone || isFailed;

  return (
    <div
      className="group flex items-center gap-2 my-1 py-0.5 rounded-md transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* State indicator strip */}
      <div
        className={`
          w-0.5 self-stretch rounded-full shrink-0 transition-all duration-200
          ${isDone ? "bg-green-500" : isFailed ? "bg-red-400" : "bg-transparent"}
        `}
      />

      {/* Text */}
      <span
        className={`
          flex-1 text-sm leading-relaxed transition-colors duration-200
          ${isDone ? "line-through text-secondary" : ""}
          ${isFailed ? "line-through opacity-40 text-primary" : ""}
          ${!isActive ? "text-primary" : ""}
        `}
      >
        {text}
      </span>

      {/* Action buttons — hover-reveal on desktop, always visible on touch */}
      <div
        className={`
          flex items-center gap-1 shrink-0
          transition-all duration-150
          sm:opacity-0 sm:group-hover:opacity-100
        `}
      >
        {/* Centang / Selesai */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleChecklistItem(noteId, index, "done");
          }}
          title="Tandai selesai"
          className={`
            w-6 h-6 rounded flex items-center justify-center transition-all duration-150
            ${
              isDone
                ? "bg-green-100 text-green-600 border border-green-300"
                : "border border-custom text-secondary hover:bg-green-50 hover:border-green-300 hover:text-green-600"
            }
          `}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <polyline
              points="1.5,5.5 4,8.5 9.5,2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Silang / Gagal */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleChecklistItem(noteId, index, "failed");
          }}
          title="Tandai gagal/skip"
          className={`
            w-6 h-6 rounded flex items-center justify-center transition-all duration-150
            ${
              isFailed
                ? "bg-red-100 text-red-500 border border-red-300"
                : "border border-custom text-secondary hover:bg-red-50 hover:border-red-300 hover:text-red-500"
            }
          `}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line
              x1="2"
              y1="2"
              x2="8"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="2"
              x2="2"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChecklistItem;
