const TelegramBot = require("node-telegram-bot-api");
const { confirmLoginService } = require("../services/telegram.service");
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
  const loginToken = match[1].trim();

  console.log("🤖 Bot /start command:", { chatId, loginToken });

  if (!loginToken) {
    return bot.sendMessage(chatId, messages.welcome);
  }

  if (!uuidRegex.test(loginToken)) {
    console.log("❌ Invalid UUID format:", loginToken);
    return bot.sendMessage(chatId, messages.invalidLink);
  }

  const telegramData = {
    telegramId: msg.from.id.toString(),
    username: msg.from.username || "",
    firstName: msg.from.first_name || "",
    lastName: msg.from.last_name || "",
    loginToken,
  };

  console.log("📋 Telegram data:", telegramData);

  try {
    const result = await confirmLoginService(telegramData);
    console.log("✅ Login confirmed:", result);
    bot.sendMessage(chatId, messages.loginSuccess);
  } catch (error) {
    console.error("❌ Bot error:", {
      status: error.status,
      message: error.message,
      stack: error.stack,
    });

    if (error.message === "Token expired") {
      bot.sendMessage(chatId, messages.tokenExpired);
    } else if (error.message === "Token already used") {
      bot.sendMessage(chatId, messages.tokenUsed);
    } else if (error.message === "Invalid token") {
      bot.sendMessage(chatId, messages.invalidLink);
    } else {
      bot.sendMessage(chatId, messages.generalError);
    }
  }
});

console.log("🤖 Telegram bot started successfully");

module.exports = bot;
