import apiClient from "./axios";

export const AuthService = {
  login: async (loginData) => {
    try {
      const response = await apiClient.post("/auth/login", loginData);
      return response.data;
    } catch (error) {
      console.log("Login error:" || error.message);
      throw error;
    }
  },
  register: async (registerData) => {
    try {
      const response = await apiClient.post("/auth/register", registerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: async (token) => {
    try {
      const response = await apiClient.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
