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
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.log("ForgotPassword error:", error.response?.data || error.message);
      throw error;
    }
  },
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.log("ResetPassword error:", error.response?.data || error.message);
      throw error;
    }
  },
  changePassword: async (token, oldPassword, newPassword) => {
    try {
      const response = await apiClient.post(
        "/auth/change-password",
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log("ChangePassword error:", error.response?.data || error.message);
      throw error;
    }
  },
};
