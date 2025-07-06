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

  // Courses
  COURSES: {
    LIST: "/courses",
    DETAIL: (id) => `/courses/${id}`,
    ENROLLMENTS: (courseId) => `/courses/${courseId}/enrollments`,
    REVIEWS: (courseId) => `/courses/${courseId}/reviews`,
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
    CONSULTANT_SLOTS: (consultantId) =>
      `/appointment-slots/consultant/${consultantId}`,
    BOOK_SLOT: (slotId) => `/appointment-slots/${slotId}/book`,
  },

  // Users
  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
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
