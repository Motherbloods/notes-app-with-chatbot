const bot = require("../bot/telegram-bot");
const { confirmLoginService } = require("../services/telegram.service");

const confirmLogin = async (req, res) => {
  try {
    const result = await confirmLoginService(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Confirm login error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const handleWebhook = (req, res) => {
  const secret = req.headers["x-telegram-bot-api-secret-token"];
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }
  bot.processUpdate(req.body);

  res.sendStatus(200);
};

module.exports = { confirmLogin, handleWebhook };
