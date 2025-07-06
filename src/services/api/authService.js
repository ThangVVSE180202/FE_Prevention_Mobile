// 🔐 Authentication Service
// Handles all authentication-related API calls

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  async storeAuthData(token, user) {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      // handle error
      console.error("Failed to store auth data", e);
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem("token");
    } catch (e) {
      return null;
    }
  }

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  async logout() {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (e) {
      // handle error
      console.error("Failed to remove auth data", e);
    }
  }

  // Make authenticated requests
  async authenticatedRequest(endpoint, options = {}) {
    const token = await this.getToken();

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
