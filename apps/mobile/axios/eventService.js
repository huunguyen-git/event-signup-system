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
  createEvent: async (eventData) => {
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach((key) => {
        if (key !== "image" && key !== "banner_url") {
          let value = eventData[key];

          if (key === "max_attendees") {
            value = parseInt(value).toString();
          }

          formData.append(key, value);
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
        if (key === "host" || key === "image" || key === "banner_url") return;

        let value = eventData[key];

        if (key === "max_attendees") {
          value = parseInt(value).toString();
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
  deleteEvent: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};
