import apiClient from "./index.js";

const client = apiClient();

export const searchNotes = async (query, mode = "hybrid") => {
  const response = await client.get("/search", {
    params: {
      q: query,
      mode,
    },
  });

  return response;
};
