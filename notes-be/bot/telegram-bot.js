const TelegramBot = require("node-telegram-bot-api");
const { confirmLoginBot } = require("../services/telegram.service");
const messages = require("../utils/messages");

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const loginToken = match[1].trim();

  if (!loginToken) {
    return bot.sendMessage(chatId, messages.welcome);
  }

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

  const result = await confirmLoginBot(telegramData);

  if (result.success) {
    bot.sendMessage(chatId, messages.loginSuccess);
  } else if (result.error === "Token expired") {
    bot.sendMessage(chatId, messages.tokenExpired);
  } else if (result.error === "Token already used") {
    bot.sendMessage(chatId, messages.tokenUsed);
  } else {
    bot.sendMessage(chatId, messages.generalError);
  }
});

module.exports = bot;
