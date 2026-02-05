import { ArrowDown, Loader2, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import useScrollToBottom from "../hooks/useScrollToBottom";
import ScrollToBottomButton from "../components/ScrollToBottomButton";

function ChatBot() {
    const {
        chatContainerRef,
        bottomRef,
        showScrollDown,
        handleScroll,
        scrollToBottom,
    } = useScrollToBottom();

    const [chatMessages, setChatMessages] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatInput, setChatInput] = useState("");

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage = {
            role: "user",
            content: chatInput.trim(),
        };

        setChatMessages((prev) => [...prev, userMessage]);
        setChatInput("");
        setIsChatLoading(true);

        // simulasi delay bot (misal 1.2 detik)
        setTimeout(() => {
            const botMessage = {
                role: "assistant",
                content:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
                    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            };

            setChatMessages((prev) => [...prev, botMessage]);
            setIsChatLoading(false);
        }, 200);
    };


    useEffect(() => {
        const el = chatContainerRef.current;
        if (!el) return;

        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        if (isNearBottom) {
            scrollToBottom();
        }
    }, [chatMessages, isChatLoading]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-white">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <MessageSquare size={28} className="text-pink-500" />
                    Chat dengan Second Brain
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Tanya apapun tentang catatan yang sudah kamu simpan
                </p>
            </div>
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-auto p-6 space-y-4 relative"
            >
                {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        {" "}
                        <p>Mulai chat dengan mengetik pertanyaan</p>
                        <p className="text-sm mt-2">
                            Contoh: "Tadi aku nyatet tentang sendMessage dimana?"
                        </p>
                    </div>
                ) : (
                    chatMessages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-2xl p-4 rounded-lg ${msg.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-200"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Sources:</p>
                                        {msg.sources.map((src, j) => (
                                            <div
                                                key={j}
                                                className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1"
                                            >
                                                {src.content.substring(0, 80)}...
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <Loader2 size={20} className="animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
                <ScrollToBottomButton
                    visible={showScrollDown}
                    onClick={() => scrollToBottom()}
                />


                <div ref={bottomRef} />

            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !isChatLoading && sendChatMessage()}
                        placeholder="Tanya sesuatu..."
                        disabled={isChatLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 disabled:bg-gray-100"
                    />

                    <button
                        onClick={sendChatMessage}
                        disabled={isChatLoading || !chatInput.trim()}
                        className="p-2 rounded-lg bg-blue-600 text-white
                 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                 transition"
                        aria-label="Kirim pesan"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

        </div>
    );
}

export default ChatBot;
