import apiClient from "./index.js";

const client = apiClient();
export const analyzingNotes = (noteData) =>
  client.post("/analyze/notes", noteData);
