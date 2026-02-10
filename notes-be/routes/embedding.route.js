const express = require("express");
const router = express.Router();

const { searchLiveNotes } = require("../controllers/search.controller.js");

router.get("/search", searchLiveNotes);

module.exports = router;
