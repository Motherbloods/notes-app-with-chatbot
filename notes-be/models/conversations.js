const mongoose = require("mongoose");

const conversationsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);
conversationsSchema.index({ userId: 1, updatedAt: -1 });

const Conversation = mongoose.model("ConversationNotes", conversationsSchema);

module.exports = Conversation;
