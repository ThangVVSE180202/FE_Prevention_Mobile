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
  async createTimeSlots(slots) {
    return authService.authenticatedRequest(ENDPOINTS.APPOINTMENTS.MY_SLOTS, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ slots }),
    });
  }

  // Get available slots for a consultant
  async getConsultantSlots(consultantId) {
    return authService.authenticatedRequest(
      ENDPOINTS.APPOINTMENTS.CONSULTANT_SLOTS(consultantId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Book an appointment slot (Member only)
  async bookAppointmentSlot(slotId) {
    return authService.authenticatedRequest(
      ENDPOINTS.APPOINTMENTS.BOOK_SLOT(slotId),
      {
        method: HTTP_METHODS.PATCH,
      }
    );
  }

  // Get user's appointments (if endpoint exists)
  async getMyAppointments() {
    return authService.authenticatedRequest("/appointments/my-appointments", {
      method: HTTP_METHODS.GET,
    });
  }

  // Get consultant's appointments (if endpoint exists)
  async getConsultantAppointments() {
    return authService.authenticatedRequest(
      "/appointments/consultant-appointments",
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Cancel appointment (if endpoint exists)
  async cancelAppointment(appointmentId) {
    return authService.authenticatedRequest(
      `/appointments/${appointmentId}/cancel`,
      {
        method: HTTP_METHODS.PATCH,
      }
    );
  }

  // Get all consultants (if endpoint exists)
  async getConsultants() {
    return this.makeRequest("/users?role=consultant", {
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

    return slots;
  }

  // Format appointment status
  getAppointmentStatus(status) {
    const statusMap = {
      available: { label: "Có thể đặt", color: "#4CAF50" },
      booked: { label: "Đã đặt", color: "#FF9800" },
      completed: { label: "Hoàn thành", color: "#2196F3" },
      cancelled: { label: "Đã hủy", color: "#F44336" },
    };

    return statusMap[status] || { label: status, color: "#9E9E9E" };
  }
}

export default new AppointmentService();
