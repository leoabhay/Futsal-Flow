import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Show success toasts for mutations
    if (
      ["post", "put", "delete"].includes(
        response.config.method?.toLowerCase(),
      ) &&
      response.data.message
    ) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";

    // Global error toast
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      // Optional: redirect to login or clear session
    }
    return Promise.reject(error);
  },
);

export default api;
