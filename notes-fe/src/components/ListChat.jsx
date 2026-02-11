
function ListChat({ conversations = [], activeChatId, onSelectChat }) {

    if (!conversations.length) {
        return (
            <div className="flex-1 flex text-center items-center justify-center">
                <p className="text-gray-400 text-center">
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
                    className={`px-4 py-3 cursor-pointer transition
            ${activeChatId === chat._id
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