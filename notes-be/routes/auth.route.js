const express = require("express");
const router = express.Router();
const {
  requestLogin,
  verifyLoginToken,
  logout,
  verifyAuth,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.post("/request-login", requestLogin);
router.post("/verify-login", verifyLoginToken);

router.post("/logout", authMiddleware, logout);
router.get("/verify", authMiddleware, verifyAuth);

module.exports = router;
