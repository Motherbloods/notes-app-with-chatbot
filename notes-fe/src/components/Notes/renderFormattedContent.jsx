import React from "react";
import { CheckSquare, Square } from "lucide-react";
import CodeWithTabs from "./CodeWithTabs";

function renderFormattedContent(note, toggleChecklistItem) {
  // Code display
  if (note.category === "kode") {
    return <CodeWithTabs note={note} />;
  }

  const lines = note.content.split("\n");
  const elements = [];
  let currentList = [];
  let currentListType = null;
  let checklistCounter = 0; // Track checklist index for toggle

  const flushList = () => {
    if (currentList.length > 0) {
      if (currentListType === "numbered") {
        elements.push(
          <ol
            key={`list-${elements.length}`}
            className="list-decimal list-inside space-y-1 my-2 text-primary"
          >
            {currentList.map((item, i) => (
              <li key={i}>
                {item}
              </li>
            ))}
          </ol>
        );
      } else if (currentListType === "bullet") {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="list-disc list-inside space-y-1 my-2 text-primary"
          >
            {currentList.map((item, i) => (
              <li key={i}>
                {item}
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
      currentListType = null;
    }
  };

  lines.forEach((line, lineIndex) => {
    // Checklist pattern: - [ ] or - [x] or • [ ] etc.
    const checklistMatch = line.match(/^([-•*]?\s*)\[([ xX])\]\s*(.+)$/);

    if (checklistMatch) {
      flushList();

      const isChecked = checklistMatch[2].toLowerCase() === 'x';
      const text = checklistMatch[3].replace(/\s*<!--completed:.*?-->\s*$/, '').trim();
      const currentChecklistIndex = checklistCounter;
      checklistCounter++;

      elements.push(
        <div
          key={`checklist-${lineIndex}`}
          className="flex items-start gap-2 my-1"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleChecklistItem(note._id, currentChecklistIndex);
            }}
            className="mt-0.5 shrink-0 hover:opacity-70 transition-opacity"
            aria-label={isChecked ? "Uncheck item" : "Check item"}
          >
            {isChecked ? (
              <CheckSquare size={18} className="text-green-600" />
            ) : (
              <Square size={18} className="text-secondary" />
            )}
          </button>
          <span
            className={`
        ${isChecked ? "line-through text-secondary" : "text-primary"}
      `}
          >
            {text}
          </span>
        </div>
      );
      return;
    }

    // Numbered list pattern: 1. Item
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (currentListType !== "numbered") {
        flushList();
        currentListType = "numbered";
      }
      currentList.push(numberedMatch[2]);
      return;
    }

    // Bullet list pattern: - Item or • Item
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      if (currentListType !== "bullet") {
        flushList();
        currentListType = "bullet";
      }
      currentList.push(bulletMatch[1]);
      return;
    }

    // Regular text
    flushList();
    if (line.trim()) {
      elements.push(
        <p
          key={`text-${lineIndex}`}
          className="text-primary my-1"
        >
          {line}
        </p>

      );
    } else {
      elements.push(<div key={`space-${lineIndex}`} className="h-2" />);
    }
  });

  flushList();
  return <div>{elements}</div>;
}

export default renderFormattedContent;