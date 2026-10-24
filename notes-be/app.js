require("dotenv").config();
const validateEnv = require("./utils/env");
const connectDB = require("./utils/db");

(async () => {
  try {
    validateEnv();
    const app = require("./utils/utils");
    require("./bot/telegram-bot");
    await connectDB();
    const PORT = process.env.PORT || 3003;
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = () => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Server error:", error.message);
    process.exit(1);
  }
})();
