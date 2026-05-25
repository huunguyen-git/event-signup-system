import apiClient from "./axios";

export const NotificationService = {
  SaveToken: async (id, token) => {
    try {
      const response = await apiClient.post(
        `/notifications/save-token/${id}`,
        token,
      );
      return response.data;
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  },
  getUserNotifications: async (userId) => {
    try {
      const response = await apiClient.get(`/notifications/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },
  sendAndSaveNotification: async (notificationData) => {
    try {
      const response = await apiClient.post(
        "/notifications/send",
        notificationData,
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        console.log("🔴 Bị lỗi 404 khi gọi đến URL:", error.config.url);
        console.log("🔴 Data gửi đi lúc đó là:", error.config.data);
      } else {
        console.error("Lỗi:", error);
      }
      throw error;
    }
  },
  markIsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error mark is read notification:", error);
      throw error;
    }
  },
};
