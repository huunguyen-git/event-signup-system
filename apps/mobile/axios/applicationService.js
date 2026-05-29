import apiClient from "./axios";

export const ApplicationService ={
  registerForEvent: async (applicationData) => {
    try {
      const response = await apiClient.post("/applications", applicationData);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
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
  checkIn: async (eventId)=>{
    try{
         const response = await apiClient.patch(`/applications/${eventId}/check-in`);
         return response.data;
    } catch(error){
        console.log(error);
        throw error;
    }
  },
  getEventApplications: async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/applications`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}