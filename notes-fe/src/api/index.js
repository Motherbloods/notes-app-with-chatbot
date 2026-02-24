import axios from "axios";

export default function apiClient() {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    (config) => {
      return config;
    },
    (err) => {
      console.log("API Request Error:", err.message || err);
      return Promise.reject(err);
    },
  );

  client.interceptors.response.use(
    (response) => response.data,
    (err) => {
      console.log(
        "API Response Error:",
        err.response?.data || err.message || err,
      );
      return Promise.reject(err);
    },
  );

  return client;
}
