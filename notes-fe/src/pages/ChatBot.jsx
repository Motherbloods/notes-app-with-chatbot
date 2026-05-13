import { ArrowDown, Loader2, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import ts from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import useScrollToBottom from "../hooks/useScrollToBottom";
import ScrollToBottomButton from "../components/ScrollToBottomButton";
import ListChat from "../components/ListChat";
import { getConversations, sendMessage, getMessages } from "../api/analyzing";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("css", css);

function ChatBot() {
  const {
    chatContainerRef,
    bottomRef,
    showScrollDown,
    handleScroll,
    scrollToBottom,
  } = useScrollToBottom();

  const [chatMessages, setChatMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);

  const handleSelectChat = async (chatId) => {
    if (chatId === activeChatId) return;
    if (isChatLoading) return;

    setActiveChatId(chatId);
    setChatMessages([]);

    try {
      const messages = await getMessages(chatId);
      setChatMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setChatMessages([]);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: "user",
      content: chatInput.trim(),
      conversationId: activeChatId,
    };

    setChatInput("");
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const msg = await sendMessage(userMessage);
      const { botMessage, conversation } = msg;

      if (!activeChatId) {
        setActiveChatId(conversation._id);
      }

      setChatMessages((prev) => [...prev, botMessage]);
      setConversations((prev) => {
        const exist = prev.find((c) => c._id === conversation._id);
        if (exist) {
          return prev.map((c) =>
            c._id === conversation._id ? conversation : c,
          );
        } else {
          return [conversation, ...prev];
        }
      });
    } catch (error) {
      console.error(error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Terjadi kesalahan 😢" },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        if (isMounted) {
          setConversations(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading, scrollToBottom]);

  return (
    <div className="h-full flex flex-row bg-primary text-primary">
      <div className="h-full w-[70%] flex flex-col">
        <div className="p-6 border-b border-primary bg-primary">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare size={28} className="text-accent" />
            Chat dengan Second Brain
          </h2>

          <p className="text-sm text-secondary mt-1">
            Tanya apapun tentang catatan yang sudah kamu simpan
          </p>
        </div>
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto p-6 space-y-4 relative bg-secondary"
        >
          {chatMessages.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              <p>Mulai chat dengan mengetik pertanyaan</p>
              <p className="text-sm mt-2">
                Contoh: "Tadi aku nyatet tentang sendMessage dimana?"
              </p>
            </div>
          ) : (
            chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                  max-w-2xl p-4 rounded-xl
                  ${
                    msg.role === "user"
                      ? "bg-accent text-white"
                      : "bg-primary border border-primary"
                  }
                `}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-tertiary px-1.5 py-0.5 rounded text-sm">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-primary border border-primary p-4 rounded-lg">
                <Loader2 size={20} className="animate-spin text-secondary" />
              </div>
            </div>
          )}
          <ScrollToBottomButton
            visible={showScrollDown}
            onClick={() => scrollToBottom()}
          />

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-primary bg-primary">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isChatLoading && sendChatMessage()
              }
              placeholder="Tanya sesuatu..."
              disabled={isChatLoading}
              className="
              flex-1 px-4 py-2
              bg-secondary
              border border-primary
              rounded-lg
              text-primary
              focus:outline-none
              focus:ring-2
              focus:ring-accent
              disabled:opacity-50
            "
            />

            <button
              onClick={sendChatMessage}
              disabled={isChatLoading || !chatInput.trim()}
              className="
              p-2 rounded-lg
              bg-accent text-white
              hover:opacity-90
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition
            "
              aria-label="Kirim pesan"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-[30%] h-full flex flex-col border-l border-primary bg-primary">
        <ListChat
          conversations={conversations}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
        />
      </div>
    </div>
  );
}

export default ChatBot;
