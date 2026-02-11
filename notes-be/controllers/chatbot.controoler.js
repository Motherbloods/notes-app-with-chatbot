const {
  sendMessageService,
  getConversationsService,
  getMessagesService,
} = require("../services/chatbot.service");
const sendMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;
    const result = await sendMessageService({ conversationId, role, content });
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await getConversationsService("motherbloodss");
    res.status(200).json(conversations);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const messages = await getMessagesService(conversationId);
    res.json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

module.exports = { getConversations, sendMessage, getMessages };
