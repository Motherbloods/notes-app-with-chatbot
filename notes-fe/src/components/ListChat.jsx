
function ListChat({ conversations = [], activeChatId, onSelectChat }) {
    conversations = [
        {
            id: "1",
            title: "Scroll to bottom React",
            lastMessage: "Gimana cara bikin scroll otomatis ke bawah?",
            updatedAt: "2026-02-05T10:30:00Z",
        },
        {
            id: "2",
            title: "useRef dan useEffect",
            lastMessage: "Kapan pakai useRef dibanding useState?",
            updatedAt: "2026-02-04T15:12:00Z",
        },
        {
            id: "3",
            title: "Layout h-screen problem",
            lastMessage: "Kenapa h-screen di parent dan child bentrok?",
            updatedAt: "2026-02-03T09:45:00Z",
        },
        {
            id: "4",
            title: "Second Brain Notes",
            lastMessage: "Cari catatan tentang sendMessage",
            updatedAt: "2026-02-02T20:10:00Z",
        },
    ];
    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((chat) => (
                <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`px-4 py-3 cursor-pointer transition
            ${activeChatId === chat.id
                            ? "bg-gray-200"
                            : "hover:bg-gray-100"
                        }
          `}
                >
                    <p className="font-medium truncate">{chat.title}</p>
                    <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default ListChat;