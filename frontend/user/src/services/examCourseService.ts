import axios from "./axios";

export interface ExamCourse {
  examCourseId: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  level: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export const examCourseService = {
  async getExamCourses(): Promise<ExamCourse[]> {
    try {
      console.log("Making API request to:", "/api/ExamCourse");
      const response = await axios.get("/api/ExamCourse");
      console.log("Raw API response:", response);
      return response.data;
    } catch (error: any) {
      console.error("Detailed API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw new Error(error.response?.data?.message || "Failed to fetch exam courses");
    }
  },

  async getExamCourseById(id: number): Promise<ExamCourse> {
    try {
      const response = await axios.get(`/api/examcourse/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch exam course");
    }
  }
};

export default examCourseService;