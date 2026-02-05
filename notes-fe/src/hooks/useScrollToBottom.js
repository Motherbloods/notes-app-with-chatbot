import { useRef, useState } from "react";

function useScrollToBottom() {
  const bottomRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatContainerRef = useRef(null);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    console.log(isAtBottom);
    setShowScrollDown(!isAtBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return {
    chatContainerRef,
    bottomRef,
    showScrollDown,
    handleScroll,
    scrollToBottom,
  };
}

export default useScrollToBottom;
