import apiClient from "./axios";

export const CommentService = {
  getCommentsByEvent: async (eventId) => {
    try {
      const response = await apiClient.get(`/comments/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách bình luận:", error);
      throw error;
    }
  },

  postComment: async (token, eventId, content, parentId) => {
    try {
      const response = await apiClient.post(
        "/comments",
        {
          event_id: eventId,
          content: content,
          parent_id: parentId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi đăng bình luận:", error);
      throw error;
    }
  },

  pinComment: async (token, commentId) => {
    try {
      const response = await apiClient.patch(
        `/comments/${commentId}/pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi ghim bình luận:", error);
      throw error;
    }
  }
};