// 📝 Appointment Booking Screen
// Confirm and book an appointment slot

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appointmentService } from "../../services/api";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";
import { useAuth } from "../../context";

const AppointmentBookingScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { slot, consultantId, consultantName } = route.params;
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const formattedSlot = appointmentService.formatTimeSlot(slot);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await appointmentService.getUserAppointmentStatus();
      setUserProfile(response.data.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const handleConfirmBooking = async () => {
    // Check if user can book appointments
    if (
      userProfile &&
      !appointmentService.canUserBookAppointments(userProfile)
    ) {
      const strikesInfo = appointmentService.getUserStrikesInfo(userProfile);
      const banInfo = appointmentService.formatBanInfo(strikesInfo.banUntil);

      Alert.alert(
        "Không thể đặt lịch",
        banInfo
          ? banInfo.message
          : "Tài khoản của bạn hiện không thể đặt lịch hẹn.",
        [{ text: "OK" }]
      );
      return;
    }

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
          onPress: () => bookAppointment(),
        },
      ]
    );
  };

  const bookAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.bookAppointmentSlot(slot._id);

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

      const errorInfo = appointmentService.handleBookingError(error);

      switch (errorInfo.type) {
        case "banned":
          Alert.alert("Tài khoản bị khóa", errorInfo.message);
          break;
        case "limit_exceeded":
          Alert.alert("Quá giới hạn", errorInfo.message);
          break;
        case "time_warning":
          Alert.alert("Thời gian không hợp lệ", errorInfo.message);
          break;
        case "conflict":
          Alert.alert(
            "Xung đột lịch hẹn",
            "Khung giờ này đã được đặt bởi người khác. Vui lòng chọn khung giờ khác."
          );
          // Go back to refresh the slots
          navigation.goBack();
          break;
        default:
          Alert.alert(
            "Lỗi",
            errorInfo.message || "Không thể đặt lịch hẹn. Vui lòng thử lại."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
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

        {/* User Status Card */}
        {userProfile && (
          <View style={styles.statusCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.cardTitle}>Trạng thái tài khoản</Text>
            </View>

            {(() => {
              const strikesInfo =
                appointmentService.getUserStrikesInfo(userProfile);
              const cancellationLimits =
                appointmentService.getUserCancellationLimits(userProfile);
              const banInfo = appointmentService.formatBanInfo(
                strikesInfo.banUntil
              );

              if (banInfo) {
                return (
                  <View style={styles.banWarning}>
                    <Ionicons name="ban" size={16} color="#EF4444" />
                    <Text style={styles.banText}>{banInfo.message}</Text>
                  </View>
                );
              }

              return (
                <View style={styles.statusGrid}>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Cảnh cáo</Text>
                    <Text
                      style={[
                        styles.statusValue,
                        strikesInfo.currentStrikes >= 2
                          ? styles.warningText
                          : styles.normalText,
                      ]}
                    >
                      {strikesInfo.currentStrikes}/3
                    </Text>
                  </View>

                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Hủy lịch hôm nay</Text>
                    <Text
                      style={[
                        styles.statusValue,
                        cancellationLimits.dailyCancellations >= 2
                          ? styles.warningText
                          : styles.normalText,
                      ]}
                    >
                      {cancellationLimits.dailyCancellations}/3
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}

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
            style={[
              styles.confirmButton,
              (loading ||
                (userProfile &&
                  !appointmentService.canUserBookAppointments(userProfile))) &&
                styles.disabledButton,
            ]}
            onPress={handleConfirmBooking}
            disabled={
              loading ||
              (userProfile &&
                !appointmentService.canUserBookAppointments(userProfile))
            }
          >
            <Text style={styles.confirmButtonText}>
              {loading
                ? "Đang đặt lịch..."
                : userProfile &&
                    !appointmentService.canUserBookAppointments(userProfile)
                  ? "Không thể đặt lịch"
                  : "Xác nhận đặt lịch"}
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
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
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
  statusCard: {
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
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statusItem: {
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  normalText: {
    color: "#10B981",
  },
  warningText: {
    color: "#F59E0B",
  },
  banWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  banText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
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
  disabledButton: {
    backgroundColor: "#9CA3AF",
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
