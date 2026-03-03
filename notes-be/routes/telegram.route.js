const express = require("express");
const router = express.Router();
const { confirmLogin } = require("../controllers/telegram.controller");

router.post("/confirm-login", confirmLogin);

module.exports = router;
