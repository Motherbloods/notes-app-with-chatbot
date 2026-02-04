import React from "react";
import { CheckSquare, Square } from "lucide-react";
function renderFormattedContent(note, toggleChecklistItem) {
  if (note.category === "kode") {
    return (
      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto max-h-64 font-mono">
        {note.codeMetadata?.formatted || note.content}
      </pre>
    );
  }

  const lines = note.content.split("\n");
  const elements = [];
  let currentList = [];
  let currentListType = null;

  const flushList = () => {
    if (currentList.length > 0) {
      if (currentListType === "numbered") {
        elements.push(
          <ol
            key={elements.length}
            className="list-decimal list-inside space-y-1 my-2"
          >
            {currentList.map((item, i) => (
              <li key={i} className="text-gray-700">
                {item}
              </li>
            ))}
          </ol>,
        );
      } else if (currentListType === "bullet") {
        elements.push(
          <ul
            key={elements.length}
            className="list-disc list-inside space-y-1 my-2"
          >
            {currentList.map((item, i) => (
              <li key={i} className="text-gray-700">
                {item}
              </li>
            ))}
          </ul>,
        );
      }
      currentList = [];
      currentListType = null;
    }
  };

  lines.forEach((line, lineIndex) => {
    // Checklist
    const checklistMatch = line.match(/^[-•]?\s*\[([ x])\]\s*(.+)$/);
    if (checklistMatch && note.checklist) {
      flushList();
      const checklistItemIndex =
        lines
          .slice(0, lineIndex)
          .filter((l) => l.match(/^[-•]?\s*\[([ x])\]\s*(.+)$/)).length - 1;

      const item = note.checklist[checklistItemIndex];

      elements.push(
        <div key={lineIndex} className="flex items-start gap-2 my-1">
          <button
            onClick={() => toggleChecklistItem(note.id, checklistItemIndex)}
            className="mt-1 shrink-0"
          >
            {item?.checked ? (
              <CheckSquare size={18} className="text-green-600" />
            ) : (
              <Square size={18} className="text-gray-400" />
            )}
          </button>
          <span
            className={`text-gray-700 ${item?.checked ? "line-through text-gray-400" : ""}`}
          >
            {item?.text || checklistMatch[2]}
          </span>
        </div>,
      );
      return;
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (currentListType !== "numbered") {
        flushList();
        currentListType = "numbered";
      }
      currentList.push(numberedMatch[2]);
      return;
    }

    // Bullet list
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
        <p key={lineIndex} className="text-gray-700 my-1">
          {line}
        </p>,
      );
    } else {
      elements.push(<div key={lineIndex} className="h-2" />);
    }
  });

  flushList();
  return <div>{elements}</div>;
}

export default renderFormattedContent;
