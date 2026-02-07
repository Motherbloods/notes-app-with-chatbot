const { analyzeNote } = require("../controllers/analyzing.controller");
const express = require("express");
const router = express.Router();

router.post("/analyze/notes", analyzeNote);

module.exports = router;
