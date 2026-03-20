import axios from "axios";

// Create an Axios instance with a base URL for your backend API
const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: Interceptor for logging or attaching tokens
api.interceptors.request.use(
    (config) => {
        console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("[API ERROR]", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
