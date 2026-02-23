const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
    },

    firstName: String,

    lastName: String,

    avatar: String,

    provider: {
      type: String,
      enum: ["telegram", "google"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserNotes", userSchema);
