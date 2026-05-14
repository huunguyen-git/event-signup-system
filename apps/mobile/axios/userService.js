import apiClient from "./axios";

export const UserService = {
  getMe: async (token) => {
    try {
      const response = await apiClient.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  },
  updateMe: async (token, userData) => {
    try {
      const response = await apiClient.patch("/users/me", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  },
};
