const crypto = require("crypto");
const bot = require("../bot/telegram-bot");

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const handleWebhook = (req, res) => {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = req.headers["x-telegram-bot-api-secret-token"];
  if (!expected || !received || !safeEqual(received, expected)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  bot.processUpdate(req.body);
  res.sendStatus(200);
};

module.exports = { handleWebhook };
