const express = require("express");
const analyzingRoutes = require("./routes/analyzing.route");
const notesRoutes = require("./routes/notes.route");
const chatRoutes = require("./routes/chatbot.route");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/analyzing", analyzingRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
