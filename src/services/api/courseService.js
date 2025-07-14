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

  // Get user's review for a course (Authenticated)
  async getUserReview(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.MY_REVIEW(courseId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Update user's review (Authenticated)
  async updateCourseReview(courseId, reviewId, reviewData) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.UPDATE_REVIEW(courseId, reviewId),
      {
        method: HTTP_METHODS.PATCH, // Đổi từ PUT thành PATCH
        body: JSON.stringify(reviewData),
      }
    );
  }

  // Delete user's review (Authenticated)
  async deleteCourseReview(courseId, reviewId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.DELETE_REVIEW(courseId, reviewId),
      {
        method: HTTP_METHODS.DELETE,
      }
    );
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

  // Get user's enrolled courses (Authenticated)
  async getMyEnrolledCourses() {
    return authService.authenticatedRequest(ENDPOINTS.COURSES.MY_COURSES, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get course progress (Authenticated)
  async getCourseProgress(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.PROGRESS(courseId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Update course progress (Authenticated)
  async updateCourseProgress(courseId, progressData) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.PROGRESS(courseId),
      {
        method: HTTP_METHODS.PATCH,
        body: JSON.stringify(progressData),
      }
    );
  }

  // Get favorite courses (Authenticated)
  async getFavoriteCourses() {
    return authService.authenticatedRequest(ENDPOINTS.COURSES.FAVORITES, {
      method: HTTP_METHODS.GET,
    });
  }

  // Add course to favorites (Authenticated)
  async addToFavorites(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.TOGGLE_FAVORITE(courseId),
      {
        method: HTTP_METHODS.POST,
      }
    );
  }

  // Remove course from favorites (Authenticated)
  async removeFromFavorites(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.TOGGLE_FAVORITE(courseId),
      {
        method: HTTP_METHODS.DELETE,
      }
    );
  }

  // Check if course is favorited (Authenticated)
  async isFavorite(courseId) {
    try {
      return authService.authenticatedRequest(
        ENDPOINTS.COURSES.IS_FAVORITE(courseId),
        {
          method: HTTP_METHODS.GET,
        }
      );
    } catch (error) {
      return { isFavorite: false };
    }
  }

  // Get course content/modules (Authenticated for enrolled courses)
  async getCourseContent(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.CONTENT(courseId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Mark content as completed (Authenticated)
  async markContentCompleted(courseId, contentId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.MARK_COMPLETED(courseId, contentId),
      {
        method: HTTP_METHODS.POST,
      }
    );
  }

  // Parse course content for mobile display
  parseCourseContent(content) {
    // Simple markdown parser for mobile
    const sections = content.split(/^# /gm).filter(Boolean);

    return sections.map((section, index) => {
      const lines = section.trim().split("\n");
      const title = lines[0];
      const content = lines.slice(1).join("\n").trim();

      return {
        id: index + 1,
        title: title,
        content: content,
        type: "chapter",
      };
    });
  }

  // Check if user is enrolled in course
  async checkEnrollmentStatus(courseId) {
    try {
      await this.getCourseContent(courseId);
      return true; // If we can access content, user is enrolled
    } catch (error) {
      if (error.message.includes("đăng ký khóa học")) {
        return false; // User not enrolled
      }
      throw error; // Other errors
    }
  }

  // Format course data for display
  formatCourseData(course) {
    return {
      ...course,
      formattedDuration: this.formatDuration(course.duration),
      formattedCreatedAt: new Date(course.createdAt).toLocaleDateString(
        "vi-VN"
      ),
      authorName: course.author?.name || "Unknown Author",
      topicsText: course.topics?.join(", ") || "",
      targetAudienceText: this.getTargetAudienceText(course.targetAudience),
    };
  }

  // Format duration in minutes to readable text
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${remainingMinutes} phút`;
  }

  // Get target audience display text
  getTargetAudienceText(targetAudience) {
    const audienceMap = {
      student: "Học sinh",
      university_student: "Sinh viên",
      parent: "Phụ huynh",
      teacher: "Giáo viên",
    };
    return audienceMap[targetAudience] || targetAudience;
  }
}

export default new CourseService();
