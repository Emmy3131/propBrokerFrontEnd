import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://prop-broker.vercel.app/api/v1",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
=====================================================
REQUEST INTERCEPTOR
=====================================================
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const csrfToken = localStorage.getItem("csrfToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
