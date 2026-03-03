const express = require("express");
const router = express.Router();
const { confirmLogin } = require("../controllers/telegram.controller");
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.post("/confirm-login", confirmLogin);
router.post("/webhook", handleWebhook);

module.exports = router;
