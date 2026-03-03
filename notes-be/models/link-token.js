const mongoose = require("mongoose");

const linkTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserNotes",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "used", "expired", "failed"],
    default: "pending",
  },
  telegramId: {
    type: String,
    default: null,
  },
  failReason: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
});

module.exports = mongoose.model("LinkToken", linkTokenSchema);
