import apiClient from "./index.js";

const client = apiClient();

export const createNotes = (noteData) => client.post("/notes", noteData);
export const getNotesByCategory = (categoryKey) =>
  client.get(`/notes/category/${categoryKey}`);
export const getCategoriesNotesCount = () => client.get("/notes/count");
export const deleteNoteById = (noteId) =>
  client.delete(`/notes/delete/${noteId}`);
