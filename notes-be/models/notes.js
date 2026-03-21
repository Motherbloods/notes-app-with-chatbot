const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: null,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    originalContent: {
      type: String,
      default: null,
    },

    wasReformatted: {
      type: Boolean,
      default: false,
    },

    contentType: {
      type: String,
      enum: ["text", "code", "file"],
      default: "text",
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    language: {
      type: String,
      default: null,
    },

    fileContext: {
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

    lineFormats: [
      {
        originalLine: String,
        suggestedFormat: {
          type: String,
          enum: ["checklist", "numbered", "bullet", "keep"],
        },
        convertedLine: String,
        reason: String,
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
});

module.exports = mongoose.model("Note", noteSchema);
