const express = require("express");
const router = express.Router();

const { searchNotes } = require("../controllers/search.controller.js");

router.get("/search", searchNotes);

module.exports = router;
