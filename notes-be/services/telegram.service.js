const axios = require("axios");
const User = require("../models/user");
const LoginToken = require("../models/login-token");

const urlBackend = process.env.URL_BACKEND || "http://localhost:3000/api";

const confirmLoginBot = async ({
  loginToken,
  telegramId,
  username,
  firstName,
  lastName,
}) => {
  try {
    await axios.post(`${urlBackend}/confirm-login`, {
      loginToken,
      telegramId,
      username,
      firstName,
      lastName,
    });
    return { success: true };
  } catch (error) {
    const errorMsg = error.response?.data?.error || "Unknown error";
    return { success: false, error: errorMsg };
  }
};

const confirmLoginService = async ({
  loginToken,
  telegramId,
  username,
  firstName,
  lastName,
}) => {
  if (!loginToken || !telegramId) {
    throw { status: 400, message: "Login token and Telegram ID required" };
  }

  const tokenDoc = await LoginToken.findOne({ token: loginToken });
  if (!tokenDoc) throw { status: 404, message: "Invalid token" };

  if (tokenDoc.status !== "pending")
    throw { status: 400, message: "Token already used" };

  if (tokenDoc.expiresAt < new Date()) {
    tokenDoc.status = "expired";
    await tokenDoc.save();
    throw { status: 401, message: "Token expired" };
  }

  let user = await User.findOne({ telegramId });
  if (!user) {
    user = await User.create({
      telegramId,
      username: username || `user_${telegramId}`,
      firstName,
      lastName,
    });
  }

  tokenDoc.status = "used";
  tokenDoc.telegramId = telegramId;
  await tokenDoc.save();

  return {
    message: "Login confirmed successfully",
    user: {
      telegramId: user.telegramId,
      username: user.username,
    },
  };
};

module.exports = { confirmLoginBot, confirmLoginService };
