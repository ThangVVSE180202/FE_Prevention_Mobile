// 📅 Appointment Service
// Handles all appointment booking and management API calls

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import authService from "./authService";

class AppointmentService {
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

  // Create time slots (Consultant only)
  async createTimeSlots(slotsData) {
    console.log("Creating time slots with data:", slotsData);

    try {
      const result = await authService.authenticatedRequest(
        ENDPOINTS.APPOINTMENTS.MY_SLOTS,
        {
          method: HTTP_METHODS.POST,
          body: JSON.stringify(slotsData),
        }
      );

      console.log("Create slots result:", result);
      return result;
    } catch (error) {
      console.error("Error in createTimeSlots:", error);
      throw error;
    }
  }

  // Get available slots for a consultant (Public endpoint)
  async getConsultantSlots(consultantId) {
    return authService.authenticatedRequest(
      ENDPOINTS.APPOINTMENTS.CONSULTANT_SLOTS(consultantId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Book an appointment slot (Member only)
  async bookAppointmentSlot(slotId, data = {}) {
    return authService.authenticatedRequest(
      ENDPOINTS.APPOINTMENTS.BOOK_SLOT(slotId),
      {
        method: HTTP_METHODS.PATCH,
        body: JSON.stringify(data),
      }
    );
  }

  // Get consultant's own slots (Consultant only) - NEW
  async getMySlots() {
    return authService.authenticatedRequest(ENDPOINTS.APPOINTMENTS.MY_SLOTS, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get user's bookings (Member only) - NEW
  async getMyBookings() {
    return authService.authenticatedRequest(
      ENDPOINTS.APPOINTMENTS.MY_BOOKINGS,
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Cancel appointment (Member only) - NEW
  async cancelAppointmentSlot(slotId) {
    return authService.authenticatedRequest(
      ENDPOINTS.APPOINTMENTS.CANCEL_SLOT(slotId),
      {
        method: HTTP_METHODS.PATCH,
      }
    );
  }

  // Mark no-show (Consultant only) - NEW
  async markNoShow(slotId) {
    return authService.authenticatedRequest(
      ENDPOINTS.APPOINTMENTS.MARK_NO_SHOW(slotId),
      {
        method: HTTP_METHODS.PATCH,
      }
    );
  }

  // Get all consultants - NEW (now available)
  async getConsultants() {
    return authService.authenticatedRequest(ENDPOINTS.USERS.CONSULTANTS, {
      method: HTTP_METHODS.GET,
    });
  }

  // Format time slot for display
  formatTimeSlot(slot) {
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);

    return {
      ...slot,
      formattedDate: startTime.toLocaleDateString("vi-VN"),
      formattedStartTime: startTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formattedEndTime: endTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formattedTimeRange: `${startTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      isToday: this.isToday(startTime),
      isPast: startTime < new Date(),
    };
  }

  // Check if date is today
  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Group slots by date
  groupSlotsByDate(slots) {
    const grouped = {};

    slots.forEach((slot) => {
      const formatted = this.formatTimeSlot(slot);
      const dateKey = formatted.formattedDate;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(formatted);
    });

    // Sort slots within each date
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
    });

    return grouped;
  }

  // Validate time slot creation
  validateTimeSlot(slot) {
    const errors = [];
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    const now = new Date();

    if (startTime <= now) {
      errors.push("Thời gian bắt đầu phải sau thời điểm hiện tại");
    }

    if (endTime <= startTime) {
      errors.push("Thời gian kết thúc phải sau thời gian bắt đầu");
    }

    const duration = endTime - startTime;
    const minDuration = 30 * 60 * 1000; // 30 minutes
    const maxDuration = 2 * 60 * 60 * 1000; // 2 hours

    if (duration < minDuration) {
      errors.push("Khung thời gian tối thiểu là 30 phút");
    }

    if (duration > maxDuration) {
      errors.push("Khung thời gian tối đa là 2 giờ");
    }

    return errors;
  }

  // Generate time slots for a day
  generateDaySlots(date, startHour = 9, endHour = 17, slotDuration = 60) {
    const slots = [];
    const baseDate = new Date(date);

    console.log("generateDaySlots input:", {
      date,
      startHour,
      endHour,
      slotDuration,
    });
    console.log("baseDate:", baseDate);

    for (let hour = startHour; hour < endHour; hour += slotDuration / 60) {
      const startTime = new Date(baseDate);
      startTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + slotDuration);

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    }

    console.log("Generated slots:", slots);
    return slots;
  }

  // Format appointment status
  getAppointmentStatus(status, isNoShow = false) {
    const statusMap = {
      available: { label: "Có thể đặt", color: "#4CAF50" },
      booked: {
        label: isNoShow ? "Không đến hẹn" : "Đã đặt",
        color: isNoShow ? "#F44336" : "#FF9800",
      },
      completed: { label: "Hoàn thành", color: "#2196F3" },
      cancelled: { label: "Đã hủy", color: "#F44336" },
    };

    return statusMap[status] || { label: status, color: "#9E9E9E" };
  }

  // Get appointment action buttons based on status and user role
  getAvailableActions(appointment, userRole) {
    const actions = [];
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const timeUntilStart = startTime - now;
    const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);

    if (
      userRole === "member" &&
      appointment.status === "booked" &&
      !appointment.isNoShow
    ) {
      // Members can cancel their bookings
      actions.push({
        type: "cancel",
        label: "Hủy lịch hẹn",
        color: "#F44336",
        disabled: false,
      });
    }

    if (
      userRole === "consultant" &&
      appointment.status === "booked" &&
      !appointment.isNoShow
    ) {
      // Consultants can mark no-show after appointment time
      if (now > startTime) {
        actions.push({
          type: "mark_no_show",
          label: "Đánh dấu không đến",
          color: "#F44336",
          disabled: false,
        });
      }
    }

    return actions;
  }

  // Handle appointment booking errors with strikes system
  handleBookingError(error) {
    const message = error.message;

    if (message.includes("khoá chức năng đặt lịch")) {
      // User is banned
      return { type: "banned", message };
    } else if (message.includes("2 lịch cùng lúc")) {
      // Too many active bookings
      return { type: "limit_exceeded", message };
    } else if (message.includes("30 phút")) {
      // Too close to appointment time
      return { type: "time_warning", message };
    } else if (message.includes("409")) {
      // Slot conflict
      return { type: "conflict", message };
    }
    return { type: "unknown", message };
  }

  // Handle appointment cancellation errors
  handleCancelError(error) {
    const message = error.message;

    if (message.includes("hết lượt hủy")) {
      // Daily limit reached
      return { type: "daily_limit", message };
    } else if (message.includes("đợi") && message.includes("tiếng")) {
      // Cooldown active
      const timeMatch = message.match(/(\d+) tiếng (\d+) phút/);
      return {
        type: "cooldown",
        message,
        hours: timeMatch ? parseInt(timeMatch[1]) : 0,
        minutes: timeMatch ? parseInt(timeMatch[2]) : 0,
      };
    } else if (message.includes("chỉ có thể hủy lịch hẹn của mình")) {
      // Not user's appointment
      return { type: "unauthorized", message };
    }
    return { type: "unknown", message };
  }

  // Parse user status from API responses
  parseUserStatus(responseData) {
    return {
      currentStrikes: responseData.userStatus?.strikes || 0,
      maxStrikes: 3,
      isBanned: responseData.userStatus?.isBanned || false,
      banUntil: responseData.userStatus?.banUntil,
      dailyCancellations: responseData.userStatus?.dailyCancellations || 0,
      maxDailyCancellations: 3,
      nextCancelAvailable: responseData.userStatus?.nextCancelAvailable,
    };
  }
}

export default new AppointmentService();
