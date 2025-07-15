// 👤 User Service
// Handles all user profile and management API calls

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import authService from "./authService";

class UserService {
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

  // Get user profile by ID (Authenticated)
  async getUserById(userId) {
    return authService.authenticatedRequest(ENDPOINTS.USERS.DETAIL(userId), {
      method: HTTP_METHODS.GET,
    });
  }

  // Get current user profile
  async getCurrentUserProfile() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser._id) {
      throw new Error("No current user found");
    }

    return this.getUserById(currentUser._id);
  }

  async getCurrentUserInProfile() {
    return authService.authenticatedRequest(ENDPOINTS.USERS.ME, {
      method: HTTP_METHODS.GET,
    });
  }

  // Update user profile (if endpoint exists)
  async updateUserProfile(userId, userData) {
    return authService.authenticatedRequest(ENDPOINTS.USERS.DETAIL(userId), {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(userData),
    });
  }

  // Update current user profile
  async updateCurrentUserProfile(userData) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser._id) {
      throw new Error("No current user found");
    }

    return this.updateUserProfile(currentUser._id, userData);
  }

  async updateCurrentUserInProfile(userData) {
  return authService.authenticatedRequest(ENDPOINTS.USERS.UPDATE_ME, {
    method: HTTP_METHODS.PATCH,
    body: JSON.stringify(userData),
  });
}

  // Get all users (Admin only)
  async getAllUsers(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.role) queryParams.append("role", params.role);
    if (params.sort) queryParams.append("sort", params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.USERS.LIST}?${queryString}`
      : ENDPOINTS.USERS.LIST;

    return authService.authenticatedRequest(endpoint, {
      method: HTTP_METHODS.GET,
    });
  }

  // Delete user (Admin only)
  async deleteUser(userId) {
    return authService.authenticatedRequest(ENDPOINTS.USERS.DETAIL(userId), {
      method: HTTP_METHODS.DELETE,
    });
  }

  // Get users by role
  async getUsersByRole(role, params = {}) {
    return this.getAllUsers({
      ...params,
      role,
    });
  }

  // Get consultants
  async getConsultants() {
    return this.getUsersByRole("consultant");
  }

  // Change password (if endpoint exists)
  async changePassword(passwordData) {
    return authService.authenticatedRequest("/users/change-password", {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(passwordData),
    });
  }

  // Upload profile photo (if endpoint exists)
  async uploadProfilePhoto(userId, photoData) {
    // Note: This would typically use FormData for file upload
    const formData = new FormData();
    formData.append("photo", photoData);

    return authService.authenticatedRequest(`/users/${userId}/photo`, {
      method: HTTP_METHODS.PATCH,
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }

  // Get user's course enrollments
  async getUserEnrollments(userId) {
    return authService.authenticatedRequest(`/users/${userId}/enrollments`, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get current user's enrollments
  async getCurrentUserEnrollments() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser._id) {
      throw new Error("No current user found");
    }

    return this.getUserEnrollments(currentUser._id);
  }

  // Get user's survey results
  async getUserSurveyResults(userId) {
    return authService.authenticatedRequest(`/users/${userId}/survey-results`, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get current user's survey results
  async getCurrentUserSurveyResults() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser._id) {
      throw new Error("No current user found");
    }

    return this.getUserSurveyResults(currentUser._id);
  }

  // Get user's appointments
  async getUserAppointments(userId) {
    return authService.authenticatedRequest(`/users/${userId}/appointments`, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get current user's appointments
  async getCurrentUserAppointments() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser._id) {
      throw new Error("No current user found");
    }

    return this.getUserAppointments(currentUser._id);
  }

  // Format user data for display
  formatUserData(user) {
    return {
      ...user,
      formattedJoinDate: new Date(user.createdAt).toLocaleDateString("vi-VN"),
      initials: this.getInitials(user.name),
      roleName: this.getRoleName(user.role),
    };
  }

  // Get user initials for avatar
  getInitials(name) {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  // Get role display name
  getRoleName(role) {
    const roleNames = {
      guest: "Khách",
      member: "Thành viên",
      staff: "Nhân viên",
      consultant: "Chuyên viên tư vấn",
      manager: "Quản lý",
      admin: "Quản trị viên",
    };

    return roleNames[role] || role;
  }

  // Validate user profile data
  validateProfileData(userData) {
    const errors = [];

    if (!userData.name || userData.name.trim().length < 2) {
      errors.push("Tên phải có ít nhất 2 ký tự");
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push("Email không hợp lệ");
    }

    return errors;
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if user has permission
  hasPermission(user, permission) {
    // This would integrate with your role permissions system
    const { ROLE_PERMISSIONS } = require("../../constants/roles");

    if (!user || !user.role) {
      return false;
    }

    const userPermissions = ROLE_PERMISSIONS[user.role];
    return userPermissions && userPermissions[permission];
  }
}

export default new UserService();
