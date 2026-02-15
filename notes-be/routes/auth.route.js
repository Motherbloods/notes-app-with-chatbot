const express = require("express");
const router = express.Router();
const {
  requestLogin,
  verifyLoginToken,
  logout,
  verifyAuth,
} = require("../controllers/auth.controller");

router.post("/request-login", requestLogin);
router.post("/verify-login", verifyLoginToken);
router.post("/logout", logout);
router.get("/verify", verifyAuth);

module.exports = router;
