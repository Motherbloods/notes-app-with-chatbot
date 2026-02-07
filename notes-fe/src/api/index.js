import axios from "axios";

export default function apiClient() {
  const client = axios.create({
    baseURL: "http://localhost:3000/api",
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
