const express = require("express");
const router = express.Router();

const { searchNotes } = require("../controllers/search.controller.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.use(authMiddleware);
router.get("/search", searchNotes);

module.exports = router;
