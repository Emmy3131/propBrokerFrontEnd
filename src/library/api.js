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

    /*
    =====================================================
    AUTHORIZATION
    =====================================================
    */

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
    =====================================================
    CSRF TOKEN
    =====================================================
    */

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    /*
    =====================================================
    FORMDATA REQUESTS
    =====================================================

    Let the browser/Axios automatically create:

    Content-Type: multipart/form-data; boundary=...

    Do NOT manually set it.
    */

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },

  (error) => Promise.reject(error),
);

export default api;
