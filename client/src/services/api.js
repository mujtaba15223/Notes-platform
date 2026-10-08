import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicAuthRequest = ["/auth/me", "/auth/login", "/auth/register"].includes(
      error.config?.url
    );
    if (error.response?.status === 401 && !isPublicAuthRequest) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/me", data),
};

export const notesAPI = {
  getNotes: (params) => api.get("/notes", { params }),
  getNote: (id) => api.get(`/notes/${id}`),
  createNote: (formData) => api.post("/notes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  downloadNote: (id) => api.get(`/notes/${id}/download`, { responseType: "blob" }),
  getMyNotes: (params) => api.get("/notes/my-notes", { params }),
};

export const subjectsAPI = {
  getSubjects: (params) => api.get("/subjects", { params }),
  getSubject: (id) => api.get(`/subjects/${id}`),
  createSubject: (data) => api.post("/subjects", data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

export const topicsAPI = {
  getTopics: (params) => api.get("/topics", { params }),
  getTopic: (id) => api.get(`/topics/${id}`),
  createTopic: (data) => api.post("/topics", data),
  updateTopic: (id, data) => api.put(`/topics/${id}`, data),
  deleteTopic: (id) => api.delete(`/topics/${id}`),
};

export const usersAPI = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  getUserNotes: (id, params) => api.get(`/users/${id}/notes`, { params }),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllNotes: (params) => api.get("/admin/notes", { params }),
  approveNote: (id) => api.put(`/admin/notes/${id}/approve`),
  rejectNote: (id) => api.put(`/admin/notes/${id}/reject`),
  deleteNote: (id) => api.delete(`/admin/notes/${id}`),
};

export default api;