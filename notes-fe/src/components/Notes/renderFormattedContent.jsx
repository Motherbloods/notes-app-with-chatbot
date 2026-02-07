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
            className="list-decimal list-inside space-y-1 my-2"
          >
            {currentList.map((item, i) => (
              <li key={i} className="text-gray-700">
                {item}
              </li>
            ))}
          </ol>
        );
      } else if (currentListType === "bullet") {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="list-disc list-inside space-y-1 my-2"
          >
            {currentList.map((item, i) => (
              <li key={i} className="text-gray-700">
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
    const checklistMatch = line.match(/^([-•]?\s*)\[([ xX])\]\s*(.+)$/);

    if (checklistMatch) {
      flushList();

      const isChecked = checklistMatch[2].toLowerCase() === 'x';
      const text = checklistMatch[3];
      const currentChecklistIndex = checklistCounter;
      checklistCounter++;

      elements.push(
        <div key={`checklist-${lineIndex}`} className="flex items-start gap-2 my-1">
          <button
            onClick={() => toggleChecklistItem(note._id || note.id, currentChecklistIndex)}
            className="mt-0.5 shrink-0 hover:opacity-70 transition-opacity"
            aria-label={isChecked ? "Uncheck item" : "Check item"}
          >
            {isChecked ? (
              <CheckSquare size={18} className="text-green-600" />
            ) : (
              <Square size={18} className="text-gray-400" />
            )}
          </button>
          <span
            className={`text-gray-700 ${isChecked ? "line-through text-gray-400" : ""}`}
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
    const bulletMatch = line.match(/^[-•]\s+(.+)$/);
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
        <p key={`text-${lineIndex}`} className="text-gray-700 my-1">
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