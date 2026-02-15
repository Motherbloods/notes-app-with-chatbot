const express = require("express");
const analyzingRoutes = require("../routes/analyzing.route");
const notesRoutes = require("../routes/notes.route");
const embeddingRoutes = require("../routes/embedding.route");
const chatRoutes = require("../routes/chatbot.route");
const authRoutes = require("../routes/auth.route");
const telegramRoutes = require("../routes/telegram.route");
const { authenticateToken } = require("../middleware/auth.middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Backend Notes API is running!");
});

app.use("/api", analyzingRoutes);
app.use("/api", notesRoutes);
app.use("/api", embeddingRoutes);
app.use("/api", chatRoutes);
app.use("/api", authRoutes);
app.use("/api", telegramRoutes);

module.exports = app;
