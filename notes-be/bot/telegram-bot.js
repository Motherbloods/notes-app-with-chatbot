const TelegramBot = require("node-telegram-bot-api");
const {
  confirmLoginService,
  confirmLinkTelegramService,
} = require("../services/telegram.service");
const messages = require("../utils/messages");

const token = process.env.TOKEN;

if (!token) {
  console.error("❌ TELEGRAM TOKEN NOT FOUND");
}

const bot = new TelegramBot(token, {
  polling: {
    autoStart: false,
    interval: 300,
    params: {
      timeout: 10,
    },
  },
});

async function startBot() {
  try {
    await bot.startPolling();
    console.log("🤖 Telegram bot started successfully");
  } catch (err) {
    console.error("❌ Failed to start polling:", err.message);
  }
}

startBot();

bot.on("polling_error", (err) => {
  console.error("⚠️ Polling error:", err.message);
});

bot.on("error", (err) => {
  console.error("⚠️ Telegram error:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("⚠️ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err);
});

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const param = match[1].trim();

  if (!param) {
    return bot.sendMessage(chatId, messages.welcome);
  }

  if (param.startsWith("link_")) {
    const linkToken = param.slice(5);

    if (!uuidRegex.test(linkToken)) {
      return bot.sendMessage(chatId, messages.invalidLink);
    }

    const telegramData = {
      linkToken,
      telegramId: msg.from.id.toString(),
      username: msg.from.username || "",
      firstName: msg.from.first_name || "",
      lastName: msg.from.last_name || "",
    };

    try {
      await confirmLinkTelegramService(telegramData);
      return bot.sendMessage(chatId, messages.linkSuccess);
    } catch (error) {
      console.error("❌ Link telegram error:", error);
      const errorMessages = {
        "Token expired": messages.tokenExpired,
        "Token already used": messages.tokenUsed,
        "Invalid token": messages.invalidLink,
        "Akun Telegram ini sudah terhubung ke akun lain.":
          messages.alreadyLinkedOther,
        "Akun Telegram sudah terhubung ke akun ini.":
          messages.alreadyLinkedSelf,
      };
      return bot.sendMessage(
        chatId,
        errorMessages[error.message] || messages.generalError,
      );
    }
  }

  const loginToken = param;

  if (!uuidRegex.test(loginToken)) {
    return bot.sendMessage(chatId, messages.invalidLink);
  }

  const telegramData = {
    telegramId: msg.from.id.toString(),
    username: msg.from.username || "",
    firstName: msg.from.first_name || "",
    lastName: msg.from.last_name || "",
    loginToken,
  };

  try {
    await confirmLoginService(telegramData);
    return bot.sendMessage(chatId, messages.loginSuccess);
  } catch (error) {
    console.error("❌ Bot login error:", error);
    const errorMessages = {
      "Token expired": messages.tokenExpired,
      "Token already used": messages.tokenUsed,
      "Invalid token": messages.invalidLink,
    };
    return bot.sendMessage(
      chatId,
      errorMessages[error.message] || messages.generalError,
    );
  }
});

module.exports = bot;
