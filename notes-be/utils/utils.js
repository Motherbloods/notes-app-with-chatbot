const express = require("express");
const analyzingRoutes = require("../routes/analyzing.route");
const notesRoutes = require("../routes/notes.route");
const embeddingRoutes = require("../routes/embedding.route");
const chatRoutes = require("../routes/chatbot.route");
const cors = require("cors");
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

app.use("/api", analyzingRoutes);
app.use("/api", notesRoutes);
app.use("/api", embeddingRoutes);
// app.use("/api", chatRoutes);

module.exports = app;
