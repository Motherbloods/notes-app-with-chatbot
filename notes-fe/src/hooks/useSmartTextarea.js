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
      const numberedMatch = currentLine.match(/^(\d+)(?:\.?\s*)(.*)$/);

      if (numberedMatch) {
        const currentNum = parseInt(numberedMatch[1], 10);
        const restText = numberedMatch[2]; // <- "halo", "halo dunia", dll
        const nextNum = currentNum + 1;

        e.preventDefault();

        const normalizedCurrentLine =
          restText.trim().length > 0
            ? `${currentNum}. ${restText}`
            : `${currentNum}.`;

        const textBeforeLine = textBeforeCursor.slice(
          0,
          textBeforeCursor.length - currentLine.length,
        );

        const newText =
          textBeforeLine +
          normalizedCurrentLine +
          "\n" +
          `${nextNum}. ` +
          textAfterCursor;

        setInputContent(newText);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            textBeforeLine.length +
            normalizedCurrentLine.length +
            1 +
            `${nextNum}. `.length;
        }, 0);

        return;
      }

      const checklistMatch = currentLine.match(
        /^\s*([-•*])?\s*\[([ xX]?)\]\s*(.*)$/,
      );

      if (checklistMatch) {
        const checked = checklistMatch[2] || " ";
        const restText = checklistMatch[3];

        e.preventDefault();

        const textBeforeLine = textBeforeCursor.slice(
          0,
          textBeforeCursor.length - currentLine.length,
        );

        if (restText.trim() === "") {
          const newText = textBeforeLine + "\n" + textAfterCursor;

          setInputContent(newText);

          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd =
              textBeforeLine.length + 1;
          }, 0);

          return;
        }

        const normalizedCurrentLine = `- [${checked}] ${restText}`;

        const newText =
          textBeforeLine + normalizedCurrentLine + "\n" + textAfterCursor;

        setInputContent(newText);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            textBeforeLine.length + normalizedCurrentLine.length + 1 + 6; // panjang "- [ ] "
        }, 0);

        return;
      }

      const bulletMatch = currentLine.match(/^([-•*])\s*(.*)$/);

      if (bulletMatch) {
        const restText = bulletMatch[2];

        e.preventDefault();

        // normalize current line
        const normalizedCurrentLine =
          restText.trim().length > 0 ? `- ${restText}` : `-`;

        const textBeforeLine = textBeforeCursor.slice(
          0,
          textBeforeCursor.length - currentLine.length,
        );

        const newText =
          textBeforeLine + normalizedCurrentLine + "\n- " + textAfterCursor;

        setInputContent(newText);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            textBeforeLine.length + normalizedCurrentLine.length + 1 + 2;
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
