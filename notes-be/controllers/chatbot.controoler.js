const {
  sendMessageService,
  getConversationsService,
  getMessagesService,
} = require("../services/chatbot.service");
const sendMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User ID not found" });
    }

    console.log(
      `💬 Send message - userId: ${userId}, conversationId: ${conversationId}`,
    );

    const result = await sendMessageService({
      conversationId,
      role,
      content,
      userId,
    });
    res.status(200).json(result);
  } catch (e) {
    console.error("❌ Send message error:", e);
    res.status(500).json({ error: e.message });
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

    console.log(`📋 Get conversations - userId: ${userId}`);

    const conversations = await getConversationsService(userId);
    res.status(200).json(conversations);
  } catch (e) {
    console.error("❌ Get conversations error:", e);
    res.status(500).json({ error: e.message });
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

    console.log(
      `💬 Get messages - userId: ${userId}, conversationId: ${conversationId}`,
    );

    const messages = await getMessagesService(conversationId, userId);
    res.json(messages);
  } catch (error) {
    console.error("❌ Error in getMessages controller:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

module.exports = { getConversations, sendMessage, getMessages };
