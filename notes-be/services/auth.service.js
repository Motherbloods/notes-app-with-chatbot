const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");
const LoginToken = require("../models/login-token.model");

const requestLoginService = async () => {
  const loginToken = uuidv4();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  await LoginToken.create({
    token: loginToken,
    status: "pending",
    expiresAt,
  });

  const botUsername = process.env.TELEGRAM_BOT;
  const telegramUrl = `https://t.me/${botUsername}?start=${loginToken}`;

  return {
    loginToken,
    telegramUrl,
    expiresIn: 300,
  };
};

const verifyLoginTokenService = async (loginToken) => {
  if (!loginToken) {
    throw { status: 400, message: "Login token required" };
  }

  const tokenDoc = await LoginToken.findOne({ token: loginToken });

  if (!tokenDoc) {
    throw { status: 404, message: "Invalid token" };
  }

  if (tokenDoc.status === "expired" || tokenDoc.expiresAt < new Date()) {
    throw { status: 401, message: "Token expired" };
  }

  if (tokenDoc.status === "pending") {
    return { status: "pending", message: "Waiting for Telegram confirmation" };
  }

  if (tokenDoc.status === "used" && tokenDoc.telegramId) {
    const user = await User.findOne({ telegramId: tokenDoc.telegramId });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const jwtToken = jwt.sign(
      { userId: user._id, telegramId: user.telegramId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    await LoginToken.deleteOne({ _id: tokenDoc._id });

    return {
      jwtToken,
      user: {
        telegramId: user.telegramId,
        username: user.username,
      },
    };
  }

  throw { status: 400, message: "Invalid token status" };
};

const verifyAuthService = async (token) => {
  if (!token) {
    throw { status: 401, message: "Unauthorized" };
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-__v");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return {
    telegramId: user.telegramId,
    username: user.username,
  };
};

module.exports = {
  requestLoginService,
  verifyLoginTokenService,
  verifyAuthService,
};
