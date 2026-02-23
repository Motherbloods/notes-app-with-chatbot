const TelegramBot = require("node-telegram-bot-api");
const { confirmLoginService } = require("../services/telegram.service");
const messages = require("../utils/messages");

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

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
