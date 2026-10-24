const {
  sendMessageService,
  getConversationsService,
  getMessagesService,
} = require("../services/chatbot.service");
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.userId;

    if (typeof content !== "string" || !content.trim() || content.length > 8000) {
      return res.status(400).json({ error: "Invalid message content" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User ID not found" });
    }

    const result = await sendMessageService({
      conversationId,
      role: "user",
      content: content.trim(),
      userId,
    });
    res.status(200).json(result);
  } catch (e) {
    console.error("❌ Send message error:", e);
    if (e.message === "Conversation not found or access denied") {
      return res.status(404).json({ error: e.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User ID not found" });
    }

    const conversations = await getConversationsService(userId);
    res.status(200).json(conversations);
  } catch (e) {
    console.error("❌ Get conversations error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User ID not found" });
    }

    const messages = await getMessagesService(conversationId, userId);
    res.json(messages);
  } catch (error) {
    console.error("❌ Error in getMessages controller:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

module.exports = { getConversations, sendMessage, getMessages };
