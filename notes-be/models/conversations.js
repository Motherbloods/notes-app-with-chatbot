const mongoose = require("mongoose");

const conversationsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: "motherbloodss",
    },
    lastMessage: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Conversation = mongoose.model("ConversationNotes", conversationsSchema);

module.exports = Conversation;
