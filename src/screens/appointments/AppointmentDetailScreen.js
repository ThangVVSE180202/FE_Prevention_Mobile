// 📄 Appointment Detail Screen
// Display detailed information about a specific appointment

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appointmentService, userService } from "../../services/api";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointment } = route.params;
  const [loading, setLoading] = useState(false);

  const formattedSlot = appointmentService.formatTimeSlot(appointment);
  const statusInfo = appointmentService.getAppointmentStatus(
    appointment.status
  );
  const canCancel = appointment.status === "booked" && !formattedSlot.isPast;

  const handleCancelAppointment = () => {
    Alert.alert(
      "Xác nhận hủy lịch hẹn",
      `Bạn có chắc chắn muốn hủy lịch hẹn vào ${formattedSlot.formattedTimeRange} ngày ${formattedSlot.formattedDate}?`,
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Hủy lịch hẹn",
          style: "destructive",
          onPress: cancelAppointment,
        },
      ]
    );
  };

  const cancelAppointment = async () => {
    try {
      setLoading(true);
      await appointmentService.cancelAppointmentSlot(appointment._id);
      Alert.alert("Thành công", "Lịch hẹn đã được hủy", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error cancelling appointment:", error);

      let errorMessage = "Không thể hủy lịch hẹn. Vui lòng thử lại.";

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message?.includes("cooldown")) {
          errorMessage = `Bạn đã hủy lịch gần đây. Vui lòng chờ ${errorData.cooldownMinutes || 30} phút trước khi thực hiện thao tác tiếp theo.`;
        } else if (errorData.message?.includes("strike")) {
          errorMessage = `Cảnh báo: Bạn đã nhận ${errorData.strikes || 1} cảnh báo do hủy lịch. ${errorData.strikes >= 3 ? "Tài khoản của bạn có thể bị tạm khóa." : ""}`;
        } else if (errorData.message?.includes("banned")) {
          const unbanDate = errorData.unbanDate
            ? new Date(errorData.unbanDate).toLocaleDateString("vi-VN")
            : "";
          errorMessage = `Tài khoản của bạn đã bị tạm khóa do hủy lịch quá nhiều lần. ${unbanDate ? `Bạn có thể sử dụng lại từ ${unbanDate}.` : ""}`;
        } else if (errorData.message?.includes("too late")) {
          errorMessage =
            "Không thể hủy lịch hẹn vào thời điểm này. Vui lòng liên hệ trực tiếp với chuyên viên.";
        }
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContactConsultant = () => {
    if (appointment.consultant?.email) {
      const email = appointment.consultant.email;
      const subject = `Liên hệ về lịch hẹn ngày ${formattedSlot.formattedDate}`;
      const body = `Xin chào ${appointment.consultant.name},\n\nTôi muốn liên hệ về lịch hẹn vào ${formattedSlot.formattedTimeRange} ngày ${formattedSlot.formattedDate}.\n\nCảm ơn!`;

      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      Linking.canOpenURL(mailtoUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(mailtoUrl);
          } else {
            Alert.alert("Lỗi", "Không thể mở ứng dụng email");
          }
        })
        .catch((err) => {
          Alert.alert("Lỗi", "Không thể mở ứng dụng email");
        });
    }
  };

  const getAppointmentInstructions = () => {
    switch (appointment.status) {
      case "booked":
        if (formattedSlot.isToday) {
          return "Lịch hẹn của bạn là hôm nay. Hãy chuẩn bị và đến đúng giờ.";
        } else if (formattedSlot.isPast) {
          return "Lịch hẹn này đã qua. Nếu bạn đã tham gia, kết quả sẽ được cập nhật sớm.";
        } else {
          return "Lịch hẹn đã được xác nhận. Bạn sẽ nhận được nhắc nhở trước giờ hẹn.";
        }
      case "completed":
        return "Lịch hẹn đã hoàn thành. Cảm ơn bạn đã tham gia!";
      case "cancelled":
        return "Lịch hẹn này đã bị hủy.";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Chi tiết lịch hẹn</Text>
          <Text style={styles.subtitle}>Thông tin đầy đủ về cuộc hẹn</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
        >
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.appointmentCard}>
          <Text style={styles.cardTitle}>Thông tin lịch hẹn</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày:</Text>
            <Text style={styles.value}>{formattedSlot.formattedDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời gian:</Text>
            <Text style={styles.value}>{formattedSlot.formattedTimeRange}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời lượng:</Text>
            <Text style={styles.value}>
              {Math.round(
                (new Date(appointment.endTime) -
                  new Date(appointment.startTime)) /
                  (1000 * 60)
              )}{" "}
              phút
            </Text>
          </View>

          {formattedSlot.isToday && (
            <View style={styles.todayNotice}>
              <Text style={styles.todayText}>⚠️ Lịch hẹn hôm nay</Text>
            </View>
          )}
        </View>

        {appointment.consultant && (
          <View style={styles.consultantCard}>
            <Text style={styles.cardTitle}>Chuyên viên tư vấn</Text>

            <View style={styles.consultantInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userService.getInitials(appointment.consultant.name)}
                </Text>
              </View>

              <View style={styles.consultantDetails}>
                <Text style={styles.consultantName}>
                  {appointment.consultant.name}
                </Text>
                <Text style={styles.consultantEmail}>
                  {appointment.consultant.email}
                </Text>
                <Text style={styles.consultantRole}>
                  {userService.getRoleName(appointment.consultant.role)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactConsultant}
            >
              <Text style={styles.contactButtonText}>Liên hệ chuyên viên</Text>
            </TouchableOpacity>
          </View>
        )}

        {appointment.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.cardTitle}>Ghi chú</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        <View style={styles.instructionsCardBetter}>
          <View style={styles.instructionsHeaderRow}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#3B82F6"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.instructionsTitle}>Hướng dẫn & Lưu ý</Text>
          </View>
          <View style={styles.instructionsContentRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#10B981"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.instructionsMainText}>
              {getAppointmentInstructions()}
            </Text>
          </View>
          <View style={styles.instructionsList}>
            <View style={styles.instructionsListItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#3B82F6"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.instructionsListText}>Đến đúng giờ hẹn</Text>
            </View>
            <View style={styles.instructionsListItem}>
              <Ionicons
                name="id-card-outline"
                size={16}
                color="#3B82F6"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.instructionsListText}>
                Mang theo giấy tờ tùy thân
              </Text>
            </View>
            <View style={styles.instructionsListItem}>
              <Ionicons
                name="help-circle-outline"
                size={16}
                color="#3B82F6"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.instructionsListText}>
                Chuẩn bị các câu hỏi muốn thảo luận
              </Text>
            </View>
            <View style={styles.instructionsListItem}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color="#3B82F6"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.instructionsListText}>
                Thông báo trước nếu cần thay đổi lịch hẹn
              </Text>
            </View>
          </View>
        </View>

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, loading && styles.disabledButton]}
            onPress={handleCancelAppointment}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>
              {loading ? "Đang hủy..." : "Hủy lịch hẹn"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    width: 100,
  },
  value: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
    fontWeight: "600",
  },
  todayNotice: {
    backgroundColor: "#F59E0B",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  todayText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
  consultantCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consultantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  consultantDetails: {
    flex: 1,
  },
  consultantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  consultantEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  consultantRole: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  contactButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  instructionsCardBetter: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  instructionsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },
  instructionsContentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionsMainText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },
  instructionsList: {
    marginTop: 2,
  },
  instructionsListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  instructionsListText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  bottomPadding: {
    height: 20,
  },
});

export default AppointmentDetailScreen;
