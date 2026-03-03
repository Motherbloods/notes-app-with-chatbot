import apiClient from "./index.js";

const client = apiClient();

export const requestLogin = async () => {
  return await client.post("/request-login");
};

export const verifyLoginToken = async (loginToken) => {
  return await client.post("/verify-login", { loginToken });
};

export const logout = async () => {
  return await client.post("/logout");
};

export const verifyAuth = async () => {
  return await client.get("/verify");
};

export const loginGoogle = async (idToken) => {
  return await client.post("/google", { idToken });
};

export const linkGoogle = async (idToken) => {
  return await client.post("/link/google", { idToken });
};

export const requestLinkTelegram = async () => {
  return await client.post("/link/telegram/request");
};

export const verifyLinkToken = async (linkToken) => {
  return await client.post("/link/telegram/verify", { linkToken });
};
