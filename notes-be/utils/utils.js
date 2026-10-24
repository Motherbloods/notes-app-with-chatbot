const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const mongoose = require("mongoose");
const analyzingRoutes = require("../routes/analyzing.route");
const notesRoutes = require("../routes/notes.route");
const embeddingRoutes = require("../routes/embedding.route");
const chatRoutes = require("../routes/chatbot.route");
const authRoutes = require("../routes/auth.route");
const { handleWebhook } = require("../controllers/telegram.controller");

const app = express();

app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS || 1));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

const allowedOrigins = (process.env.FRONTENDURL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, origin ? true : false);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());

const jsonLimiter = (max, windowMs) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
  });

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.send("Backend Notes API is running!");
});

app.get("/health", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({ status: dbReady ? "ok" : "degraded" });
});

app.post("/api/telegram/webhook", handleWebhook);

app.use("/api", jsonLimiter(300, 60 * 1000));
app.use(
  ["/api/request-login", "/api/verify-login", "/api/google"],
  jsonLimiter(60, 15 * 60 * 1000),
);
app.use(
  ["/api/message", "/api/analyze", "/api/search"],
  jsonLimiter(40, 60 * 1000),
);

app.use("/api", authRoutes);
app.use("/api", analyzingRoutes);
app.use("/api", notesRoutes);
app.use("/api", embeddingRoutes);
app.use("/api", chatRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large" });
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
