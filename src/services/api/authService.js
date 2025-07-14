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

    console.log("Making request to:", url);
    console.log("Request options:", requestOptions);

    try {
      const response = await fetch(url, requestOptions);

      console.log("Response status:", response.status);

      if (!response.ok) {
        // Cố gắng parse JSON cho error response
        let errorData;
        try {
          const text = await response.text();
          errorData = text
            ? JSON.parse(text)
            : { message: "Something went wrong" };
        } catch (e) {
          errorData = { message: "Something went wrong" };
        }

        console.log("Error response data:", errorData);
        const error = new Error(errorData.message || "Something went wrong");
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      // Kiểm tra xem response có content không trước khi parse JSON
      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");

      // Nếu không có content hoặc status 204 (No Content), trả về object success
      if (contentLength === "0" || response.status === 204) {
        console.log("Empty response, returning success object");
        return { success: true, message: "Thao tác thành công" };
      }

      // Lấy text trước để kiểm tra
      const responseText = await response.text();

      // Nếu response rỗng, trả về success
      if (!responseText || responseText.trim() === "") {
        console.log("Empty response text, returning success object");
        return { success: true, message: "Thao tác thành công" };
      }

      // Nếu có content và là JSON, parse JSON
      if (contentType && contentType.includes("application/json")) {
        try {
          const data = JSON.parse(responseText);
          console.log("Response data:", data);
          return data;
        } catch (e) {
          console.log("JSON parse error, returning text response");
          return { success: true, message: responseText };
        }
      }

      // Nếu không phải JSON, trả về text trong object
      console.log("Non-JSON response:", responseText);
      return { success: true, message: responseText };
    } catch (error) {
      console.log("Request error:", error);
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
      throw new Error("Bạn chưa đăng nhập");
    }

    // Always set Content-Type to application/json
    const authOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    return this.makeRequest(endpoint, authOptions);
  }
}

export default new AuthService();
