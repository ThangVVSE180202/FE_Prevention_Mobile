import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import authService from "./authService";

class CourseService {
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

  async getCourses(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.targetAudience)
      queryParams.append("targetAudience", params.targetAudience);
    if (params.search) queryParams.append("search", params.search);

    console.log("[CourseService] getCourses params:", params);
    console.log("[CourseService] Query string:", queryParams.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.COURSES.LIST}?${queryString}`
      : ENDPOINTS.COURSES.LIST;

    console.log("[CourseService] Final endpoint:", endpoint);

    return this.makeRequest(endpoint, {
      method: HTTP_METHODS.GET,
    });
  }

  async getCourseById(courseId) {
    return this.makeRequest(ENDPOINTS.COURSES.DETAIL(courseId), {
      method: HTTP_METHODS.GET,
    });
  }

  async enrollInCourse(courseId) {
    return authService.authenticatedRequest(ENDPOINTS.COURSES.ENROLL, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ course: courseId }),
    });
  }

  async getCourseEnrollments(courseId) {
    return this.makeRequest(ENDPOINTS.COURSES.ENROLLMENTS(courseId), {
      method: HTTP_METHODS.GET,
    });
  }

  async addCourseReview(courseId, reviewData) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.REVIEWS(courseId),
      {
        method: HTTP_METHODS.POST,
        body: JSON.stringify(reviewData),
      }
    );
  }

  async getCourseReviews(courseId) {
    return this.makeRequest(ENDPOINTS.COURSES.REVIEWS(courseId), {
      method: HTTP_METHODS.GET,
    });
  }

  async getUserReview(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.MY_REVIEW(courseId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  async updateCourseReview(courseId, reviewId, reviewData) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.UPDATE_REVIEW(courseId, reviewId),
      {
        method: HTTP_METHODS.PATCH,
        body: JSON.stringify(reviewData),
      }
    );
  }

  async deleteCourseReview(courseId, reviewId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.DELETE_REVIEW(courseId, reviewId),
      {
        method: HTTP_METHODS.DELETE,
      }
    );
  }

  async getCoursesByAudience(targetAudience, params = {}) {
    return this.getCourses({
      ...params,
      targetAudience,
    });
  }

  async searchCourses(searchTerm, params = {}) {
    return this.getCourses({
      ...params,
      search: searchTerm,
    });
  }

  async getMyEnrolledCourses() {
    return authService.authenticatedRequest(ENDPOINTS.COURSES.MY_COURSES, {
      method: HTTP_METHODS.GET,
    });
  }

  async getCompletedCourses() {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.COMPLETED_COURSES,
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  async completeSection(courseId, sectionIndex) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.COMPLETE_SECTION(courseId),
      {
        method: HTTP_METHODS.POST,
        body: JSON.stringify({ sectionIndex }),
      }
    );
  }

  async getSectionProgress(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.SECTION_PROGRESS(courseId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  async getCertificate(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.CERTIFICATE(courseId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  async getFavoriteCourses() {
    return authService.authenticatedRequest(ENDPOINTS.COURSES.FAVORITES, {
      method: HTTP_METHODS.GET,
    });
  }

  async addToFavorites(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.TOGGLE_FAVORITE(courseId),
      {
        method: HTTP_METHODS.POST,
      }
    );
  }

  async removeFromFavorites(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.TOGGLE_FAVORITE(courseId),
      {
        method: HTTP_METHODS.DELETE,
      }
    );
  }

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

  async getCourseContent(courseId) {
    return authService.authenticatedRequest(
      ENDPOINTS.COURSES.CONTENT(courseId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  async getCourseProgress(courseId) {
    return this.getSectionProgress(courseId);
  }

  async updateCourseProgress(courseId, progressData) {
    console.warn(
      "updateCourseProgress is deprecated. Use completeSection instead."
    );
    return { success: false, message: "Method deprecated" };
  }

  async markContentCompleted(courseId, contentId) {
    console.warn(
      "markContentCompleted is deprecated. Use completeSection instead."
    );
    return { success: false, message: "Method deprecated" };
  }

  parseCourseContent(content) {
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

  async checkEnrollmentStatus(courseId) {
    try {
      await this.getCourseContent(courseId);
      return true;
    } catch (error) {
      if (error.message.includes("đăng ký khóa học")) {
        return false;
      }
      throw error;
    }
  }

  async getTopics() {
    try {
      console.log("[CourseService] Fetching all topics");
      const response = await this.makeRequest(ENDPOINTS.COURSES.TOPICS, {
        method: HTTP_METHODS.GET,
      });
      console.log("[CourseService] Topics response:", response);
      return response;
    } catch (error) {
      console.error("[CourseService] Error fetching topics:", error);
      throw error;
    }
  }

  async searchCoursesByTopics(topics, params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (topics && topics.length > 0) {
        const topicsString = Array.isArray(topics) ? topics.join(",") : topics;
        queryParams.append("topics", topicsString);
      }

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.targetAudience)
        queryParams.append("targetAudience", params.targetAudience);

      console.log("[CourseService] Searching courses by topics:", topics);
      console.log("[CourseService] Search params:", params);
      console.log("[CourseService] Query string:", queryParams.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.COURSES.SEARCH_BY_TOPICS}?${queryString}`
        : ENDPOINTS.COURSES.SEARCH_BY_TOPICS;

      const response = await this.makeRequest(endpoint, {
        method: HTTP_METHODS.GET,
      });

      console.log("[CourseService] Topics search response:", response);
      return response;
    } catch (error) {
      console.error(
        "[CourseService] Error searching courses by topics:",
        error
      );
      throw error;
    }
  }

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
