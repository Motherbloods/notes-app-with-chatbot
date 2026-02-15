const express = require("express");
const {
  getConversations,
  sendMessage,
  getMessages,
} = require("../controllers/chatbot.controoler");

const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.use(authMiddleware);
router.post("/message", sendMessage);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);

module.exports = router;
