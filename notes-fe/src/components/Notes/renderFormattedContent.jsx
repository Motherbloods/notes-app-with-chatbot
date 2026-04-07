import ChecklistItem from "./ChecklistItem";
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
              <li key={i}>{item}</li>
            ))}
          </ol>,
        );
      } else if (currentListType === "bullet") {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="list-disc list-inside space-y-1 my-2 text-primary"
          >
            {currentList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>,
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

      const isChecked = checklistMatch[2].toLowerCase() === "x";
      const rawText = checklistMatch[3];
      const isFailed = rawText.includes("<!--failed-->");
      const text = rawText
        .replace(/\s*<!--completed:.*?-->\s*$/, "")
        .replace(/\s*<!--failed-->\s*$/, "")
        .trim();

      const currentChecklistIndex = checklistCounter;
      checklistCounter++;

      let state = "none";
      if (isFailed) state = "failed";
      else if (isChecked) state = "done";

      elements.push(
        <ChecklistItem
          key={`checklist-${lineIndex}`}
          noteId={note._id}
          text={text}
          state={state}
          index={currentChecklistIndex}
          toggleChecklistItem={toggleChecklistItem}
        />,
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
          className="text-sm text-primary my-1 leading-relaxed"
        >
          {line}
        </p>,
      );
    } else {
      elements.push(<div key={`space-${lineIndex}`} className="h-2" />);
    }
  });

  flushList();
  return <div>{elements}</div>;
}

export default renderFormattedContent;
