import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5074",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
instance.interceptors.request.use(
  async (config) => {
    // Get the auth token from localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;