const User = require("../models/user");
const LoginToken = require("../models/login-token");
const LinkToken = require("../models/link-token");

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
  if (!tokenDoc) {
    throw { status: 404, message: "Invalid token" };
  }

  if (tokenDoc.status !== "pending") {
    throw { status: 400, message: "Token already used" };
  }

  if (tokenDoc.expiresAt < new Date()) {
    tokenDoc.status = "expired";
    await tokenDoc.save();
    throw { status: 401, message: "Token expired" };
  }

  let user = await User.findOne({ "providers.telegram.id": telegramId });
  if (!user) {
    user = await User.create({
      username: username || `user_${telegramId}`,
      firstName: firstName || null,
      lastName: lastName || null,
      providers: {
        telegram: {
          id: telegramId,
          username: username || null,
        },
      },
    });
  }

  tokenDoc.status = "used";
  tokenDoc.telegramId = telegramId;
  await tokenDoc.save();

  return {
    message: "Login confirmed successfully",
    user: {
      telegramId: user.providers.telegram.id,
      username: user.username,
    },
  };
};

const confirmLinkTelegramService = async ({
  linkToken,
  telegramId,
  username,
  firstName,
  lastName,
}) => {
  if (!linkToken || !telegramId)
    throw { status: 400, message: "Link token and Telegram ID required" };

  const tokenDoc = await LinkToken.findOne({ token: linkToken });
  if (!tokenDoc) throw { status: 404, message: "Invalid token" };
  if (tokenDoc.status !== "pending")
    throw { status: 400, message: "Token already used" };
  if (tokenDoc.expiresAt < new Date()) {
    tokenDoc.status = "expired";
    await tokenDoc.save();
    throw { status: 401, message: "Token expired" };
  }

  const existingUser = await User.findOne({
    "providers.telegram.id": telegramId,
  });
  if (
    existingUser &&
    existingUser._id.toString() !== tokenDoc.userId.toString()
  ) {
    tokenDoc.status = "failed";
    tokenDoc.failReason = "Akun Telegram ini sudah terhubung ke akun lain.";
    await tokenDoc.save();
    throw {
      status: 409,
      message: "Akun Telegram ini sudah terhubung ke akun lain.",
    };
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) throw { status: 404, message: "User not found" };

  if (user.providers?.telegram?.id) {
    tokenDoc.status = "failed";
    tokenDoc.failReason = "Akun Telegram sudah terhubung ke akun ini.";
    await tokenDoc.save();
    throw {
      status: 400,
      message: "Akun Telegram sudah terhubung ke akun ini.",
    };
  }

  user.providers.telegram = { id: telegramId, username: username || null };
  if (!user.firstName && firstName) user.firstName = firstName;
  if (!user.lastName && lastName) user.lastName = lastName;
  await user.save();

  tokenDoc.status = "used";
  tokenDoc.telegramId = telegramId;
  await tokenDoc.save();

  return { message: "Telegram linked successfully", username: user.username };
};

module.exports = { confirmLoginService, confirmLinkTelegramService };
