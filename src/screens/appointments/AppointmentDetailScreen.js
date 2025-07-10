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
} from "react-native";
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chi tiết lịch hẹn</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
        >
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>

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

      <View style={styles.instructionsCard}>
        <Text style={styles.cardTitle}>Hướng dẫn</Text>
        <Text style={styles.instructionsText}>
          {getAppointmentInstructions()}
        </Text>

        <Text style={styles.generalInstructions}>
          {"\n"}Lưu ý chung:{"\n"}• Đến đúng giờ hẹn{"\n"}• Mang theo giấy tờ
          tùy thân{"\n"}• Chuẩn bị các câu hỏi muốn thảo luận{"\n"}• Thông báo
          trước nếu cần thay đổi lịch hẹn
        </Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MD,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.LG,
  },
  title: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
    fontWeight: "500",
  },
  appointmentCard: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.MD,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: SPACING.SM,
  },
  label: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
    width: 100,
  },
  value: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontWeight: "600",
  },
  todayNotice: {
    backgroundColor: COLORS.WARNING,
    padding: SPACING.SM,
    borderRadius: 4,
    marginTop: SPACING.SM,
  },
  todayText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    textAlign: "center",
  },
  consultantCard: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.MD,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consultantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.MD,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.MD,
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
  },
  consultantDetails: {
    flex: 1,
  },
  consultantName: {
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  consultantEmail: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  consultantRole: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  contactButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: SPACING.SM,
    borderRadius: 4,
    alignItems: "center",
  },
  contactButtonText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
  },
  notesCard: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.MD,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notesText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: COLORS.INFO,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.MD,
  },
  instructionsText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.WHITE,
    fontWeight: "500",
    lineHeight: 20,
  },
  generalInstructions: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    lineHeight: 18,
  },
  cancelButton: {
    backgroundColor: COLORS.ERROR,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: SPACING.MD,
  },
  cancelButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY,
  },
  bottomPadding: {
    height: SPACING.LG,
  },
});

export default AppointmentDetailScreen;
