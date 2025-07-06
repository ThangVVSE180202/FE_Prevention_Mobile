// 📚 Course Service
// Handles all course-related API calls

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import authService from "./authService";

class CourseService {
  // Helper method for making API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get list of courses (Public)
  async getCourses(params = {}) {
    const queryParams = new URLSearchParams();

    // Add query parameters if provided
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.targetAudience)
      queryParams.append("targetAudience", params.targetAudience);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.COURSES.LIST}?${queryString}`
      : ENDPOINTS.COURSES.LIST;

    return this.makeRequest(endpoint, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get course details (Public)
  async getCourseById(courseId) {
    return this.makeRequest(ENDPOINTS.COURSES.DETAIL(courseId), {
      method: HTTP_METHODS.GET,
    });
  }

  // Enroll in a course (Authenticated)
  async enrollInCourse(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.ENROLLMENTS(courseId),
      {
        method: HTTP_METHODS.POST,
      }
    );
  }

  // Get course enrollments
  async getCourseEnrollments(courseId) {
    return this.makeRequest(ENDPOINTS.COURSES.ENROLLMENTS(courseId), {
      method: HTTP_METHODS.GET,
    });
  }

  // Add review to course (Authenticated)
  async addCourseReview(courseId, reviewData) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.REVIEWS(courseId),
      {
        method: HTTP_METHODS.POST,
        body: JSON.stringify(reviewData),
      }
    );
  }

  // Get course reviews
  async getCourseReviews(courseId) {
    return this.makeRequest(ENDPOINTS.COURSES.REVIEWS(courseId), {
      method: HTTP_METHODS.GET,
    });
  }

  // Get courses by target audience
  async getCoursesByAudience(targetAudience, params = {}) {
    return this.getCourses({
      ...params,
      targetAudience,
    });
  }

  // Search courses
  async searchCourses(searchTerm, params = {}) {
    return this.getCourses({
      ...params,
      search: searchTerm,
    });
  }
}

export default new CourseService();
