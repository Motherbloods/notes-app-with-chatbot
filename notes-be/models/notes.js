const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "motherbloodss",
      set: (v) => v || "motherbloodss",
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    contentType: {
      type: String,
      enum: ["text", "code", "file"],
      default: "text",
    },

    language: {
      type: String,
      default: null,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    // For code: store suggested/fixed version
    suggestedCode: {
      type: String,
      default: null,
    },

    fileName: String,
    fileType: String,
    fileUrl: String,

    embedding: {
      type: [Number],
      select: false,
    },

    summary: String,

    analysisErrors: [
      {
        line: Number,
        type: {
          type: String,
          enum: ["error", "warning", "suggestion"],
        },
        message: String,
        fix: String, // Suggested fix for this specific error
      },
    ],

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes
noteSchema.index({ userId: 1, category: 1, createdAt: -1 });
noteSchema.index({ userId: 1, deletedAt: 1 });

// Pre-find middleware untuk filter soft delete
noteSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model("Note", noteSchema);
