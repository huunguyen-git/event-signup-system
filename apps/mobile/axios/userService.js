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
      console.log(userData);
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key === "avatar_url") return;

        let value = userData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      console.log("bien event avatar_url:", userData.avatar_url);
      if (userData.avatar_url) {
        const uri = userData.avatar_url;

        if (uri.startsWith("file://")) {
          const fileName = uri.split("/").pop();
          const fileType = fileName.split(".").pop();

          formData.append("avatar_url", {
            uri: uri,
            name: fileName,
            type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
          });
        } else if (uri.startsWith("http")) {
          formData.append("avatar_url", uri);
        }
      }
      const response = await apiClient.patch("/users/me", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user data:", error.response);
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
