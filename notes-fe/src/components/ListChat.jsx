
function ListChat({ conversations = [], activeChatId, onSelectChat }) {

    if (!conversations.length) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-secondary text-center">
                    Belum ada percakapan
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((chat) => (
                <div
                    key={chat._id}
                    onClick={() => onSelectChat(chat._id)}
                    className={`
            px-4 py-3
            cursor-pointer
            transition-colors
            ${activeChatId === chat._id
                            ? "bg-tertiary"
                            : "hover:bg-secondary"
                        }
          `}
                >
                    <p className="font-medium text-primary truncate">
                        {chat.title}
                    </p>

                    <p className="text-sm text-secondary truncate">
                        {chat.lastMessage}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default ListChat;