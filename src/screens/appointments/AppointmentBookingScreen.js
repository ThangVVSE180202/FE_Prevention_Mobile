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
} from "react-native";
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
      let errorMessage = "Không thể đặt lịch hẹn. Vui lòng thử lại.";

      if (error.message.includes("409")) {
        errorMessage =
          "Rất tiếc, khung giờ này vừa có người khác đặt. Vui lòng chọn khung giờ khác.";
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Xác nhận đặt lịch</Text>

      <View style={styles.appointmentCard}>
        <Text style={styles.cardTitle}>Thông tin lịch hẹn</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Chuyên viên:</Text>
          <Text style={styles.value}>{consultantName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày:</Text>
          <Text style={styles.value}>{formattedSlot.formattedDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Thời gian:</Text>
          <Text style={styles.value}>{formattedSlot.formattedTimeRange}</Text>
        </View>

        {formattedSlot.isToday && (
          <View style={styles.todayNotice}>
            <Text style={styles.todayText}>⚠️ Lịch hẹn hôm nay</Text>
          </View>
        )}
      </View>

      <View style={styles.notesCard}>
        <Text style={styles.cardTitle}>Ghi chú (tùy chọn)</Text>
        <Text style={styles.notesDescription}>
          Mô tả ngắn gọn về vấn đề bạn muốn tư vấn hoặc những điều bạn muốn thảo
          luận.
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
          • Vui lòng đến đúng giờ hẹn{"\n"}• Nếu cần hủy hoặc thay đổi lịch hẹn,
          vui lòng thông báo trước ít nhất 2 giờ{"\n"}• Mang theo giấy tờ tùy
          thân khi đến hẹn{"\n"}• Cuộc hẹn sẽ diễn ra trong khoảng{" "}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
    textAlign: "center",
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
  notesDescription: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
    lineHeight: 18,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 80,
  },
  importantNotice: {
    backgroundColor: COLORS.INFO,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.LG,
  },
  noticeTitle: {
    fontSize: FONT_SIZES.MD,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: SPACING.SM,
  },
  noticeText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.LG,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.GRAY,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
    marginRight: SPACING.SM,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
    marginLeft: SPACING.SM,
    alignItems: "center",
  },
  confirmButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY,
  },
});

export default AppointmentBookingScreen;
