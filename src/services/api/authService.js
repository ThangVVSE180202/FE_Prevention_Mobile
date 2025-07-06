// 🔐 Authentication Service
// Handles all authentication-related API calls

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";

class AuthService {
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

  // Sign up new user
  async signup(userData) {
    return this.makeRequest(ENDPOINTS.AUTH.SIGNUP, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(userData),
    });
  }

  // Login user
  async login(credentials) {
    return this.makeRequest(ENDPOINTS.AUTH.LOGIN, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(credentials),
    });
  }

  // Google login
  async googleLogin(token) {
    return this.makeRequest(ENDPOINTS.AUTH.GOOGLE_LOGIN, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ token }),
    });
  }

  // Forgot password
  async forgotPassword(email) {
    return this.makeRequest(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ email }),
    });
  }

  // Reset password
  async resetPassword(token, passwordData) {
    return this.makeRequest(`${ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(passwordData),
    });
  }

  // Helper methods for token management
  storeAuthData(token, user) {
    // For React Native, you might want to use AsyncStorage instead
    if (typeof Storage !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  getToken() {
    if (typeof Storage !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  getCurrentUser() {
    if (typeof Storage !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    if (typeof Storage !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  // Make authenticated requests
  async authenticatedRequest(endpoint, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    return this.makeRequest(endpoint, authOptions);
  }
}

export default new AuthService();
