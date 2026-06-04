import apiClient from "./axios.js";

export const EventService = {
  getEvent: async (id) => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  },
  getEvents: async () => {
    const response = await apiClient.get("/events");
    return response.data;
  },
  getEventsByUser: async (userId) => {
    try {
      const response = await apiClient.get(`/events/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  },
  registerForEvent: async (applicationData) => {
    try {
      const response = await apiClient.post("/applications", applicationData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi kết nối!";
      throw new Error(errorMessage);
    }
  },
  getMyRegisteredEvents: async (userId) => {
    try {
      const response = await apiClient.get(`/applications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createEvent: async (eventData) => {
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach((key) => {
        if (key !== "image" && key !== "banner_url") {
          let value = eventData[key];

          if (key === "max_attendees") {
            value = parseInt(value).toString();
          }

          if (key === "equipments" && value && typeof value === "object") {
            value = JSON.stringify(value);
          }

          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });
      if (eventData.banner_url) {
        const uri = eventData.banner_url;
        const fileName = uri.split("/").pop();
        const fileType = fileName.split(".").pop();

        formData.append("banner_url", {
          uri: uri,
          name: fileName,
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        });
      }



      const response = await apiClient.post("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.log(
        "Lỗi chi tiết từ Server:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  updateEvent: async (id, eventData) => {
    try {
      const formData = new FormData();

      Object.keys(eventData).forEach((key) => {
        if (key === "host" || key === "image" || key === "banner_url" || key === "room" || key === "_count" || key === "comments" || key === "applications") return;

        let value = eventData[key];

        if (key === "max_attendees") {
          value = parseInt(value).toString();
        }

        if (key === "equipments" && value && typeof value === "object") {
          value = JSON.stringify(value);
        }

        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (eventData.banner_url) {
        const uri = eventData.banner_url;

        if (uri.startsWith("file://")) {
          const fileName = uri.split("/").pop();
          const fileType = fileName.split(".").pop();

          formData.append("banner_url", {
            uri: uri,
            name: fileName,
            type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
          });
        } else if (uri.startsWith("http")) {
          formData.append("banner_url", uri);
        }
      }
      const response = await apiClient.put(`/events/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        console.log("❌ LỖI BACKEND:", error.response.data);
      } else {
        console.log("❌ LỖI MẠNG:", error.message);
      }
      throw error;
    }
  },
  approveEvent: async (token, id) => {
    try {
      const response = await apiClient.patch(
        `/events/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Error approving event:", error.response?.data || error.message);
      throw error;
    }
  },
  deleteEvent: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
  getRooms: async () => {
    try {
      const response = await apiClient.get("/rooms");
      return response.data;
    } catch (error) {
      console.log("Error getting rooms:", error.message);
      throw error;
    }
  },
  getEquipments: async () => {
    try {
      const response = await apiClient.get("/equipments");
      return response.data;
    } catch (error) {
      console.log("Error getting equipments:", error.message);
      throw error;
    }
  },
};
