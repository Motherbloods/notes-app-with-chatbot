const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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

    providers: {
      google: {
        id: {
          type: String,
          unique: true,
          sparse: true,
          index: true,
        },
        email: String,
      },
      telegram: {
        id: {
          type: String,
          unique: true,
          sparse: true,
          index: true,
        },
        username: String,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserNotes", userSchema);
