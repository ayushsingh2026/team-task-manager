import axios from "axios";

const DEFAULT_PROD_API_ORIGIN = "https://team-task-manager-production-4752.up.railway.app";

const getApiBaseUrl = () => {
  const raw = process.env.REACT_APP_API_URL?.trim();
  if (!raw) {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "/api";
    }
    return `${DEFAULT_PROD_API_ORIGIN}/api`;
  }

  const normalized = raw.replace(/\/+$/, "");
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = (payload) => api.post("/auth/signup", payload);
export const login = (payload) => api.post("/auth/login", payload);
export const getMe = () => api.get("/auth/me");
export const getUsers = () => api.get("/auth/users");

export const getProjects = () => api.get("/projects");
export const createProject = (payload) => api.post("/projects", payload);

export const getTasksByProject = (projectId) => api.get(`/tasks/${projectId}`);
export const createTask = (payload) => api.post("/tasks", payload);
export const updateTask = (id, payload) => api.put(`/tasks/${id}`, payload);
