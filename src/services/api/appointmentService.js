// 📅 Appointment Service
// Handles all appointment booking and management API calls
//
// ✅ AVAILABLE ENDPOINTS (from API guide):
// - POST /appointment-slots/my-slots - Create time slots (Consultant only)
// - GET /appointment-slots/consultant/:id - Get consultant's available slots
// - PATCH /appointment-slots/:slotId/book - Book appointment slot (Member only)
//
// ❌ UNAVAILABLE/COMMENTED ENDPOINTS:
// - /appointments/my-appointments - Get user's appointments (not in API guide)
// - /appointments/consultant-appointments - Get consultant's appointments (not in API guide)
// - /appointments/:id/cancel - Cancel appointment (not in API guide)
// - /users?role=consultant - Get consultants (requires admin permissions)

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
    return this.makeRequest(
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

  // ✅ AVAILABLE FEATURES vs ❌ UNAVAILABLE FEATURES
  getFeatureStatus() {
    return {
      available: {
        createTimeSlots: "Consultant can create time slots",
        getConsultantSlots: "Anyone can view consultant's available slots",
        bookAppointmentSlot: "Members can book available slots",
        formatTimeSlot: "Helper methods for time formatting",
        validateTimeSlot: "Client-side validation helpers",
      },
      unavailable: {
        getMyAppointments:
          "API endpoint /appointments/my-appointments not available",
        getConsultantAppointments:
          "API endpoint /appointments/consultant-appointments not available",
        cancelAppointment:
          "API endpoint /appointments/:id/cancel not available",
        getConsultants:
          "Endpoint /users?role=consultant requires admin permissions",
      },
      recommendations: [
        "For listing appointments: Backend team needs to implement appointment list endpoints",
        "For canceling appointments: Backend team needs to implement cancel endpoint",
        "For consultant discovery: Consider implementing a public consultant directory endpoint",
        "Current workflow: Members must know specific consultant IDs to book appointments",
      ],
    };
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
