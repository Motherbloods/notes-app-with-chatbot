const User = require("../models/user");
const LoginToken = require("../models/login-token");

const confirmLoginService = async ({
  loginToken,
  telegramId,
  username,
  firstName,
  lastName,
}) => {
  console.log("🔄 confirmLoginService called:", {
    loginToken,
    telegramId,
    username,
  });

  if (!loginToken || !telegramId) {
    throw { status: 400, message: "Login token and Telegram ID required" };
  }

  const tokenDoc = await LoginToken.findOne({ token: loginToken });
  if (!tokenDoc) {
    console.log("❌ Token not found in DB:", loginToken);
    throw { status: 404, message: "Invalid token" };
  }

  console.log("📋 Token found with status:", tokenDoc.status);

  if (tokenDoc.status !== "pending") {
    console.log("❌ Token status not pending:", tokenDoc.status);
    throw { status: 400, message: "Token already used" };
  }

  if (tokenDoc.expiresAt < new Date()) {
    console.log("❌ Token expired:", tokenDoc.expiresAt);
    tokenDoc.status = "expired";
    await tokenDoc.save();
    throw { status: 401, message: "Token expired" };
  }

  let user = await User.findOne({ "providers.telegram.id": telegramId });

  if (!user) {
    console.log("👤 Creating new user for telegramId:", telegramId);
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
    console.log("✅ User created:", user._id);
  } else {
    console.log("👤 Existing user found:", user._id);
  }

  tokenDoc.status = "used";
  tokenDoc.telegramId = telegramId;
  await tokenDoc.save();

  console.log("✅ Login confirmed successfully for user:", user.username);

  return {
    message: "Login confirmed successfully",
    user: {
      telegramId: user.providers.telegram.id,
      username: user.username,
    },
  };
};

module.exports = { confirmLoginService };
