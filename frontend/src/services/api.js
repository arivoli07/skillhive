import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8082/api"
});

api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("skillhive_auth");
  if (saved) {
    const auth = JSON.parse(saved);
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  }
  return config;
});

export default api;
