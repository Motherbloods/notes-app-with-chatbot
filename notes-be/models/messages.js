const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

const Message = mongoose.model("MessageNotes", messageSchema);

module.exports = Message;
