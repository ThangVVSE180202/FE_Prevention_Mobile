// 🌐 API Configuration
// API endpoints and configuration based on the provided documentation

// Base URLs
export const API_BASE_URL = {
  PRODUCTION: "https://prevention-api-tdt.onrender.com/api/v1",
  DEVELOPMENT: "http://localhost:8001/api/v1",
};

// Use production by default, can be changed based on environment
export const BASE_URL = API_BASE_URL.PRODUCTION;

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    GOOGLE_LOGIN: "/auth/google-login",
    FORGOT_PASSWORD: "/auth/forgotPassword",
    RESET_PASSWORD: "/auth/resetPassword",
  },

  COURSES: {
    LIST: "/courses",
    DETAIL: (id) => `/courses/${id}`,
    ENROLLMENTS: (id) => `/courses/${id}/enrollments`,
    CONTENT: (id) => `/courses/${id}/content`,
    MY_COURSES: "/enrollments/my-courses",
    COMPLETED_COURSES: "/enrollments/completed-courses",

    ENROLL: "/enrollments",

    COMPLETE_SECTION: (courseId) =>
      `/enrollments/courses/${courseId}/sections/complete`,
    SECTION_PROGRESS: (courseId) =>
      `/enrollments/courses/${courseId}/sections/progress`,
    CERTIFICATE: (courseId) => `/enrollments/courses/${courseId}/certificate`,

    FAVORITES: "/courses/favorites",
    ADD_FAVORITE: (id) => `/courses/${id}/favorite`,
    REMOVE_FAVORITE: (id) => `/courses/${id}/favorite`,
    TOGGLE_FAVORITE: (id) => `/courses/${id}/favorite`,
    IS_FAVORITE: (id) => `/courses/${id}/is-favorite`,
    REVIEWS: (id) => `/courses/${id}/reviews`,
    MY_REVIEW: (id) => `/courses/${id}/my-review`,
    UPDATE_REVIEW: (courseId, reviewId) =>
      `/courses/${courseId}/reviews/${reviewId}`,
    DELETE_REVIEW: (courseId, reviewId) =>
      `/courses/${courseId}/reviews/${reviewId}`,

    TOPICS: "/courses/topics",
    SEARCH_BY_TOPICS: "/courses/search/topics",
  },

  // Surveys
  SURVEYS: {
    LIST: "/surveys",
    DETAIL: (id) => `/surveys/${id}`,
    SUBMIT: (id) => `/surveys/${id}/submit`,
  },

  // Blogs
  BLOGS: {
    LIST: "/blogs",
    DETAIL: (id) => `/blogs/${id}`,
  },

  // Appointments
  APPOINTMENTS: {
    MY_SLOTS: "/appointment-slots/my-slots",
    MY_BOOKINGS: "/appointment-slots/my-bookings",
    CONSULTANT_SLOTS: (consultantId) =>
      `/appointment-slots/consultants/${consultantId}`,
    BOOK_SLOT: (slotId) => `/appointment-slots/${slotId}/book`,
    CANCEL_SLOT: (slotId) => `/appointment-slots/${slotId}/cancel`,
    MARK_NO_SHOW: (slotId) => `/appointment-slots/${slotId}/mark-no-show`,
  },

  // Users
  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    CONSULTANTS: "/users/consultants",
    ME: "/users/me",
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

// Request timeouts
export const REQUEST_TIMEOUT = 10000; // 10 seconds
