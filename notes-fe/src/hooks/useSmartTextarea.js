import { useRef } from "react";

function useSmartTextarea(inputContent, setInputContent) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const text = textarea.value;

      const lines = text.split("\n");

      const textBeforeCursor = text.slice(0, cursorPos);
      const currentLineIndex = textBeforeCursor.split("\n").length - 1;

      if (currentLineIndex <= 0) return;

      const currentLine = lines[currentLineIndex];
      let prevLine = lines[currentLineIndex - 1];

      const currentMatch = currentLine.match(/^(\d+)\.\s*/);
      const prevMatch = prevLine.match(/^(\d+)\.\s*/);

      if (!currentMatch || !prevMatch) return;

      const currentLineStart =
        lines.slice(0, currentLineIndex).join("\n").length +
        (currentLineIndex > 0 ? 1 : 0);

      const cursorColumn = cursorPos - currentLineStart;
      const currentPrefixLength = currentMatch[0].length;

      if (cursorColumn > currentPrefixLength) return;

      e.preventDefault();

      if (/^\d+\.$/.test(prevLine)) {
        prevLine = prevLine + " ";
        lines[currentLineIndex - 1] = prevLine;

        const updatedText = lines.join("\n");
        textarea.value = updatedText;
      }

      const newPrevMatch = lines[currentLineIndex - 1].match(/^(\d+)\.\s*/);
      const prevPrefixLength = newPrevMatch[0].length;
      const prevLineStart =
        lines.slice(0, currentLineIndex - 1).join("\n").length +
        (currentLineIndex - 1 > 0 ? 1 : 0);

      const newCursorPos = prevLineStart + prevPrefixLength;

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      });
    }

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

        const cursorInLine =
          textarea.selectionStart -
          (textBeforeCursor.length - currentLine.length);

        const beforeCursorText = currentLine.slice(0, cursorInLine);
        const afterCursorText = currentLine.slice(cursorInLine);

        const textBeforeLine = textBeforeCursor.slice(
          0,
          textBeforeCursor.length - currentLine.length,
        );

        const updatedAfterCursor = textAfterCursor.replace(
          /^(\d+)\.\s/gm,
          (match, num) => `${parseInt(num, 10) + 1}. `,
        );

        const newText =
          textBeforeLine +
          beforeCursorText.trimEnd() +
          "\n" +
          `${nextNum}. ${afterCursorText.replace(/^\d+\.\s?/, "")}` +
          updatedAfterCursor;

        const newCursorPos =
          textBeforeLine.length +
          beforeCursorText.trimEnd().length +
          1 +
          `${nextNum}. `.length;

        setInputContent(newText);

        textarea.value = newText;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;

        return;
      }

      const checklistMatch = currentLine.match(
        /^\s*([-•*])?\s*\[([ xX]?)\]\s*(.*)$/,
      );

      if (checklistMatch) {
        const checked = checklistMatch[2] || " ";
        const restText = checklistMatch[3];

        e.preventDefault();

        const cursorInLine =
          textarea.selectionStart -
          (textBeforeCursor.length - currentLine.length);

        const textBeforeLine = textBeforeCursor.slice(
          0,
          textBeforeCursor.length - currentLine.length,
        );

        const prefixPattern = /^\s*([-•*])?\s*\[([ xX]?)\]\s*/;
        const prefixMatch = currentLine.match(prefixPattern);
        const prefixLength = prefixMatch ? prefixMatch[0].length : 0;

        if (restText.trim() === "") {
          const newText = textBeforeLine + "\n" + textAfterCursor;
          const newCursorPos = textBeforeLine.length + 1;

          setInputContent(newText);

          // Set immediately on textarea value to prevent flickering
          textarea.value = newText;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;

          return;
        }

        if (cursorInLine <= prefixLength) {
          const normalizedCurrentLine = `- [${checked}] ${restText}`;
          const newText =
            textBeforeLine + "\n" + normalizedCurrentLine + textAfterCursor;
          const newCursorPos = textBeforeLine.length + 1;

          setInputContent(newText);

          textarea.value = newText;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;

          return;
        }

        const cursorInRestText = cursorInLine - prefixLength;
        const beforeCursorText = restText.slice(0, cursorInRestText);
        const afterCursorText = restText.slice(cursorInRestText);

        const normalizedCurrentLine = `- [${checked}] ${beforeCursorText}`;

        const newText =
          textBeforeLine +
          normalizedCurrentLine +
          "\n" +
          afterCursorText +
          textAfterCursor;
        const newCursorPos =
          textBeforeLine.length + normalizedCurrentLine.length + 1;

        setInputContent(newText);

        textarea.value = newText;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;

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
        const newCursorPos =
          textBeforeLine.length + normalizedCurrentLine.length + 1 + 2;

        setInputContent(newText);

        textarea.value = newText;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;

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
      const newCursorPos = start + 2;

      setInputContent(newText);

      textarea.value = newText;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
    }
  };
  return {
    textareaRef,
    handleKeyDown,
  };
}

export default useSmartTextarea;
