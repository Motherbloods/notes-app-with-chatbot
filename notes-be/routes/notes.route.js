const express = require("express");
const router = express.Router();

const {
  createNote,
  getCategoriesNotesCount,
  getNotesByCategory,
  updateNote,
  deleteNoteById,
} = require("../controllers/notes.controller.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.use(authMiddleware);

router.post("/notes", createNote);
router.get("/notes/count", getCategoriesNotesCount);
// router.get("/notes/:id", getNoteById);
router.get("/notes/category/:categoryKey", getNotesByCategory);
router.patch("/notes/:id", updateNote);
router.delete("/notes/:id", deleteNoteById);

module.exports = router;
