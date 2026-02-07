const express = require("express");
const router = express.Router();

const {
  createNote,
  getCategoriesNotesCount,
} = require("../controllers/notes.controller.js");

router.post("/notes", createNote);
router.get("/notes/count", getCategoriesNotesCount);
// router.get("/notes", getAllNotes);
// router.get("/notes/:id", getNoteById);
// router.get("/notes/category/:categoryKey", getNotesByCategory);
// router.put("/notes/:id", updateNote);
// router.delete("/notes/:id", deleteNoteById);

module.exports = router;
