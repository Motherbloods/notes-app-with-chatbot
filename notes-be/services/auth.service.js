const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const LoginToken = require("../models/login-token");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  firstName: user.firstName || null,
  lastName: user.lastName || null,
  email: user.email || null,
  avatar: user.avatar || null,
  provider: user.provider,
  telegramId: user.telegramId || null,
  googleId: user.googleId || null,
});

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
    const user = await User.findOne({ telegramId: tokenDoc.telegramId }).select(
      "-__v",
    );

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const jwtToken = generateToken(user._id);

    await LoginToken.deleteOne({ _id: tokenDoc._id });

    return {
      jwtToken,
      user: formatUser(user),
    };
  }

  throw { status: 400, message: "Invalid token status" };
};

const verifyAuthService = async (userId) => {
  if (!userId) {
    throw { status: 401, message: "Unauthorized" };
  }

  const user = await User.findById(userId).select("-__v");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return formatUser(user);
};

const loginWithGoogleService = async (tokenId) => {
  try {
    if (!tokenId) {
      throw new Error("Google tokenId is required");
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token payload");
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      given_name,
      family_name,
    } = payload;

    let user = await User.findOne({ googleId }).select("-__v");

    if (!user && email) {
      user = await User.findOne({ email }).select("-__v");

      if (user) {
        user.googleId = googleId;
        user.avatar = picture;
        if (!user.provider) user.provider = "google";
        await user.save();

        console.log("🔗 Google linked to existing user:", user._id);
      }
    }

    if (!user) {
      user = await User.create({
        googleId,
        email,
        username: name || email,
        firstName: given_name || null,
        lastName: family_name || null,
        avatar: picture || null,
        provider: "google",
      });

      console.log("👤 New Google user created:", user._id);
    }

    const token = generateToken(user._id);

    return {
      token,
      user: formatUser(user),
    };
  } catch (error) {
    console.error("❌ Google auth error:", error.message);
    throw new Error("Google authentication failed");
  }
};

module.exports = {
  requestLoginService,
  verifyLoginTokenService,
  verifyAuthService,
  loginWithGoogleService,
};
