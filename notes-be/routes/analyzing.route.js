const { analyzeNote } = require("../controllers/analyzing.controller");
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.use(authMiddleware);
router.post("/analyze/notes", analyzeNote);

module.exports = router;
