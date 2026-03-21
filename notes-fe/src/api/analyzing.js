import apiClient from "./index.js";

const client = apiClient();
export const analyzingNotes = (noteData) =>
  client.post("/analyze/notes", noteData);
export const generateNoteTitle = (content) =>
  client.post("/analyze/title", { content });
export const sendMessage = (msg) => client.post("/message", msg);
export const getConversations = () => client.get("/conversations");
export const getMessages = (conversationId) =>
  client.get(`/messages/${conversationId}`);
