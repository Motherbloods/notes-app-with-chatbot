import { useRef } from "react";

function useSmartTextarea(inputContent, setInputContent) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const textarea = textareaRef.current;
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = inputContent.substring(0, cursorPos);
      const textAfterCursor = inputContent.substring(cursorPos);
      const lines = textBeforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      // Check for numbered list (1., 2., etc)
      const numberedMatch = currentLine.match(/^(\d+)\.\s/);
      if (numberedMatch) {
        const currentNum = parseInt(numberedMatch[1]);
        const nextNum = currentNum + 1;

        // If line only has number (empty item), exit list mode
        if (currentLine.trim() === `${currentNum}.`) {
          e.preventDefault();
          const newText =
            textBeforeCursor.slice(0, -currentLine.length) +
            "\n" +
            textAfterCursor;
          setInputContent(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd =
              cursorPos - currentLine.length + 1;
          }, 0);
          return;
        }

        e.preventDefault();
        const newText =
          textBeforeCursor + "\n" + nextNum + ". " + textAfterCursor;
        setInputContent(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            cursorPos + nextNum.toString().length + 3;
        }, 0);
        return;
      }

      // Check for bullet list (-, •)
      const bulletMatch = currentLine.match(/^[-•]\s/);
      if (bulletMatch) {
        // If line only has bullet (empty item), exit list mode
        if (
          currentLine.trim() === "-" ||
          currentLine.trim() === "•" ||
          currentLine.trim() === "*"
        ) {
          e.preventDefault();
          const newText =
            textBeforeCursor.slice(0, -currentLine.length) +
            "\n" +
            textAfterCursor;
          setInputContent(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd =
              cursorPos - currentLine.length + 1;
          }, 0);
          return;
        }

        e.preventDefault();
        const newText = textBeforeCursor + "\n- " + textAfterCursor;
        setInputContent(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
        }, 0);
        return;
      }

      // Check for checklist ([ ] or [x])
      const checklistMatch = currentLine.match(/^[-•]?\s*\[([ x])\]\s/);
      if (checklistMatch) {
        // If line only has checkbox (empty item), exit list mode
        if (
          currentLine.trim() === "[ ]" ||
          currentLine.trim() === "[]" ||
          currentLine.trim() === "[x]" ||
          currentLine.trim() === "- [ ]" ||
          currentLine.trim() === "- [x]"
        ) {
          e.preventDefault();
          const newText =
            textBeforeCursor.slice(0, -currentLine.length) +
            "\n" +
            textAfterCursor;
          setInputContent(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd =
              cursorPos - currentLine.length + 1;
          }, 0);
          return;
        }

        e.preventDefault();
        const newText = textBeforeCursor + "\n- [ ] " + textAfterCursor;
        setInputContent(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + 7;
        }, 0);
        return;
      }
    }

    // Tab for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        inputContent.substring(0, start) + "  " + inputContent.substring(end);
      setInputContent(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };
  return {
    textareaRef,
    handleKeyDown,
  };
}

export default useSmartTextarea;
