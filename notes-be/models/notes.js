const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: String,
      default: "motherbloodss",
      set: (v) => v || "motherbloodss",
      index: true,
    },

    // status: {
    //   type: String,
    //   enum: ["draft", "analyzed", "confirmed"],
    //   default: "draft",
    //   index: true,
    // },

    // analysisStatus: {
    //   type: String,
    //   enum: ["pending", "processing", "done", "failed"],
    //   default: "pending",
    // },

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

    language: String,

    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    category: {
      type: String,
      index: true,
    },

    fileName: String,
    fileType: String,
    fileUrl: String,

    embedding: {
      type: [Number],
      select: false,
    },

    summary: String,

    errors: [
      {
        line: Number,
        type: String,
        message: String,
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

noteSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model("Note", noteSchema);
