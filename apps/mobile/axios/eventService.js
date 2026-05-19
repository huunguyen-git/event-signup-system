import apiClient from "./axios.js";

export const EventService = {
  getEvent: async (id) => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  },
  getEvents: async () => {
    const response = await apiClient.get("/events");
    return response.data;
  },
  getEventsByUser: async (userId) => {
    try{
        const response = await apiClient.get(`/events/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
  },
  registerForEvent: async (applicationData) => {
    try {
      const response = await apiClient.post("/applications", applicationData);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getMyRegisteredEvents: async (userId) => {
    try {
      const response = await apiClient.get(`/applications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(error);
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
      console.log("bien event", eventData.banner_url);
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

      console.log("Đang gửi dữ liệu lên server...", formData);

      const response = await apiClient.post("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Kết quả từ server:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi chi tiết từ Server:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  updateEvent: async (id, eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => {
      if (key !== "image") {
        formData.append(key, eventData[key]);
        if (key === "max_attendees") {
          eventData[key] = parseInt(eventData[key]).toString();
        }
      }
    });
    if (eventData.image && eventData.image.uri) {
      const uri = eventData.image.uri;
      const fileName = uri.split("/").pop();
      const fileType = fileName.split(".").pop();

      formData.append("file", {
        uri: uri,
        name: fileName,
        type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
      });
    }
    const response = await apiClient.put(`/events/${id}`, formData);
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};