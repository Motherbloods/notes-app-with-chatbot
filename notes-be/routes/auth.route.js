const express = require("express");
const router = express.Router();
const {
  requestLogin,
  verifyLoginToken,
  logout,
  verifyAuth,
  loginGoogle,
  linkGoogle,
  requestLinkTelegram,
  verifyLinkToken,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.post("/request-login", requestLogin);
router.post("/verify-login", verifyLoginToken);
router.post("/google", loginGoogle);

router.post("/logout", authMiddleware, logout);
router.get("/verify", authMiddleware, verifyAuth);
router.post("/link/google", authMiddleware, linkGoogle);
router.post("/link/telegram/request", authMiddleware, requestLinkTelegram);
router.post("/link/telegram/verify", authMiddleware, verifyLinkToken);

module.exports = router;
