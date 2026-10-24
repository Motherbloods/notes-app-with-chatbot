const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "TOKEN",
  "TELEGRAM_BOT",
  "TELEGRAM_WEBHOOK_SECRET",
  "OPENROUTER_API_KEY",
  "FRONTENDURL",
];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
};

module.exports = validateEnv;
