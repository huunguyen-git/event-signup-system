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
      console.log("Error fetching user data:", error);
      throw error;
    }
  },
  updateMe: async (token, userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key === "avatar_url") return;

        let value = userData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      if (userData.avatar_url) {
        const uri = userData.avatar_url;
        if (uri.startsWith("http://") || uri.startsWith("https://")) {
          formData.append("avatar_url", uri);
        } 
        else {
          const fileUri = uri.startsWith("file://") ? uri : `file://${uri}`;
          const fileName = fileUri.split("/").pop() || "avatar.jpg";
          const match = /\.(\w+)$/.exec(fileName);
          const fileExtension = match ? match[1].toLowerCase() : "jpeg";
          const mimeType = fileExtension === "jpg" ? "jpeg" : fileExtension;

          formData.append("avatar_url", {
            uri: fileUri,
            name: fileName,
            type: `image/${mimeType}`,
          });
        }
      }

      // 3. Gửi Request
      const response = await apiClient.patch("/users/me", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;

    } catch (error) {
      console.log(
        "Error updating user data:", 
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.log("Error fetching user data:", error);
      throw error;
    }
  },
};
