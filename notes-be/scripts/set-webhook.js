require("dotenv").config();
const https = require("https");

const TOKEN = process.env.TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!TOKEN || !WEBHOOK_URL || !SECRET) {
  console.error(
    "❌ Pastikan TOKEN, WEBHOOK_URL, dan TELEGRAM_WEBHOOK_SECRET ada di .env",
  );
  process.exit(1);
}

const payload = JSON.stringify({
  url: WEBHOOK_URL,
  secret_token: SECRET,
  allowed_updates: ["message"],
  drop_pending_updates: true,
});

const options = {
  hostname: "api.telegram.org",
  path: `/bot${TOKEN}/setWebhook`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const result = JSON.parse(data);
    if (result.ok) {
      console.log("✅ Webhook berhasil di-set:", WEBHOOK_URL);
    } else {
      console.error("❌ Gagal set webhook:", result.description);
    }
  });
});

req.on("error", (err) => console.error("❌ Request error:", err.message));
req.write(payload);
req.end();
