const Message = require("../models/messages");
const Conversations = require("../models/conversations");
const Note = require("../models/notes");
const {
  generateTitleFromLLM,
  generateBotResponse,
} = require("./analyzing.service");

const getConversationHistory = async (conversationId) => {
  try {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(20)
      .select("role content -_id");

    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
};

const sendMessageService = async ({
  conversationId,
  role,
  content,
  userId = "motherbloodss",
}) => {
  try {
    let conversation;

    if (conversationId) {
      conversation = await Conversations.findById(conversationId);
      if (!conversation) throw new Error("Conversation not found");
    } else {
      conversation = new Conversations();
      const title = await generateTitleFromLLM(content);
      conversation.title = title;
      conversation.userId = userId;

      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      role,
      content,
    });

    await message.save();

    conversation.lastMessage = content;
    conversation.updatedAt = new Date();
    await conversation.save();
    let botMessage = null;
    if (role === "user") {
      const history = await getConversationHistory(conversation._id);

      const allNotes = await Note.find({
        userId: userId,
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      console.log(`[ChatBot] Fetched ${allNotes.length} notes for context`);

      const botContent = await generateBotResponse(content, history, allNotes);

      botMessage = new Message({
        conversationId: conversation._id,
        role: "assistant",
        content: botContent,
      });
      await botMessage.save();

      conversation.lastMessage = botContent;
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    return {
      message,
      botMessage,
      conversation,
    };
  } catch (error) {
    console.error("Error in sendMessageService:", error);
    throw error;
  }
};

const getConversationsService = async (userId = "motherbloodss") => {
  try {
    const conversations = await Conversations.find({ userId }).sort({
      updatedAt: -1,
    });
    return conversations;
  } catch (error) {
    console.error("Error in getConversationsService:", error);
    throw error;
  }
};

const getMessagesService = async (conversationId) => {
  try {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .select("role content createdAt -_id");

    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }));
  } catch (error) {
    console.error("Error in getMessagesService:", error);
    throw error;
  }
};

module.exports = {
  sendMessageService,
  getConversationsService,
  getMessagesService,
};
