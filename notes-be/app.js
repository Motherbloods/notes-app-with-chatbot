const app = require("./utils/utils");
const connectDB = require("./utils/db");
require("dotenv").config();
require("./bot/telegram-bot");
(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
})();
