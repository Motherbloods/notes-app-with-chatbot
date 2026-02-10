import apiClient from "./index.js";

const client = apiClient();

export const searchLiveNotes = (query) =>
  client.get("/search", { params: { q: query } });
