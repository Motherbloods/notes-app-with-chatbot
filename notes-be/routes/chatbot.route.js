const express = require("express");
const {
  getConversations,
  sendMessage,
  getMessages,
} = require("../controllers/chatbot.controoler");

const router = express.Router();

router.post("/message", sendMessage);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);

module.exports = router;
