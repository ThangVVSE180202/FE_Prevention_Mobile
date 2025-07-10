// 📝 Appointment Booking Screen
// Confirm and book an appointment slot

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appointmentService } from "../../services/api";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const AppointmentBookingScreen = ({ route, navigation }) => {
  const { slot, consultantId, consultantName } = route.params;
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const formattedSlot = appointmentService.formatTimeSlot(slot);

  const handleConfirmBooking = async () => {
    Alert.alert(
      "Xác nhận đặt lịch",
      `Bạn có chắc chắn muốn đặt lịch hẹn vào ${formattedSlot.formattedTimeRange} ngày ${formattedSlot.formattedDate} với ${consultantName}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: bookAppointment,
        },
      ]
    );
  };

  const bookAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.bookAppointmentSlot(slot._id, {
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        "Đặt lịch thành công!",
        "Lịch hẹn của bạn đã được xác nhận. Bạn sẽ nhận được thông báo trước giờ hẹn.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to My Appointments or back to consultant list
              navigation.navigate("MyAppointments");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error booking appointment:", error);

      let errorMessage = "Không thể đặt lịch hẹn. Vui lòng thử lại.";

      // Handle specific error cases
      if (error.response?.status === 409) {
        errorMessage =
          "Rất tiếc, khung giờ này vừa có người khác đặt. Vui lòng chọn khung giờ khác.";
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message?.includes("daily limit")) {
          errorMessage = `Bạn đã đạt giới hạn ${errorData.dailyLimit || 3} lịch hẹn trong ngày. Vui lòng thử lại vào ngày khác.`;
        } else if (errorData.message?.includes("banned")) {
          const unbanDate = errorData.unbanDate
            ? new Date(errorData.unbanDate).toLocaleDateString("vi-VN")
            : "";
          errorMessage = `Tài khoản của bạn đã bị tạm khóa do hủy lịch quá nhiều lần. ${unbanDate ? `Bạn có thể đặt lịch lại từ ${unbanDate}.` : ""}`;
        } else if (errorData.message?.includes("cooldown")) {
          errorMessage = `Bạn vừa thực hiện thao tác gần đây. Vui lòng chờ ${errorData.cooldownMinutes || 30} phút trước khi đặt lịch tiếp.`;
        } else if (errorData.message?.includes("slot not available")) {
          errorMessage =
            "Khung giờ này không còn khả dụng. Vui lòng chọn khung giờ khác.";
        }
      } else if (error.response?.status === 403) {
        errorMessage = "Bạn không có quyền đặt lịch hẹn này.";
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Xác nhận đặt lịch</Text>
          <Text style={styles.subtitle}>
            Kiểm tra thông tin trước khi xác nhận
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Appointment Details Card */}
        <View style={styles.appointmentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Thông tin lịch hẹn</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Chuyên viên:</Text>
              <Text style={styles.value}>{consultantName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Ngày:</Text>
              <Text style={styles.value}>{formattedSlot.formattedDate}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Thời gian:</Text>
              <Text style={styles.value}>
                {formattedSlot.formattedTimeRange}
              </Text>
            </View>
          </View>

          {formattedSlot.isToday && (
            <View style={styles.todayNotice}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={styles.todayText}>Lịch hẹn hôm nay</Text>
            </View>
          )}
        </View>

        {/* Notes Card */}
        <View style={styles.notesCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="document-text" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Ghi chú (tùy chọn)</Text>
          </View>
          <Text style={styles.notesDescription}>
            Mô tả ngắn gọn về vấn đề bạn muốn tư vấn hoặc những điều bạn muốn
            thảo luận.
          </Text>

          <TextInput
            style={styles.notesInput}
            placeholder="Nhập ghi chú của bạn..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.importantNotice}>
          <Text style={styles.noticeTitle}>Lưu ý quan trọng</Text>
          <Text style={styles.noticeText}>
            • Vui lòng đến đúng giờ hẹn{"\n"}• Nếu cần hủy hoặc thay đổi lịch
            hẹn, vui lòng thông báo trước ít nhất 2 giờ{"\n"}• Mang theo giấy tờ
            tùy thân khi đến hẹn{"\n"}• Cuộc hẹn sẽ diễn ra trong khoảng{" "}
            {Math.round(
              (new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60)
            )}{" "}
            phút
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.disabledButton]}
            onPress={handleConfirmBooking}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  todayNotice: {
    backgroundColor: "#FFF7ED",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  todayText: {
    color: "#F59E0B",
    fontWeight: "600",
    fontSize: 14,
  },
  notesCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  notesDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    minHeight: 80,
    textAlignVertical: "top",
  },
  importantNotice: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
});

export default AppointmentBookingScreen;
