import apiClient from "./axios";

export const ClubRequestService = {
  submitRequest: async (token, data) => {
    try {
      const response = await apiClient.post("/club-requests", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("Error submitting club request:", error);
      throw error;
    }
  },

  getMyRequest: async (token) => {
    try {
      const response = await apiClient.get("/club-requests/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("Error fetching my club request:", error);
      throw error;
    }
  },

  getAllRequests: async (token) => {
    try {
      const response = await apiClient.get("/club-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("Error fetching all club requests:", error);
      throw error;
    }
  },

  approveRequest: async (token, id) => {
    try {
      const response = await apiClient.patch(`/club-requests/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("Error approving club request:", error);
      throw error;
    }
  },

  rejectRequest: async (token, id, reason) => {
    try {
      const response = await apiClient.patch(
        `/club-requests/${id}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Error rejecting club request:", error);
      throw error;
    }
  },
};
