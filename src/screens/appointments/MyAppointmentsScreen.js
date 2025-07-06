// 📋 My Appointments Screen
// Display user's booked appointments

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { appointmentService } from "../../services/api";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const MyAppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data.appointments || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyAppointments();
  };

  const handleCancelAppointment = (appointment) => {
    const formattedSlot = appointmentService.formatTimeSlot(appointment);

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
          onPress: () => cancelAppointment(appointment._id),
        },
      ]
    );
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      Alert.alert("Thành công", "Lịch hẹn đã được hủy");
      fetchMyAppointments(); // Refresh the list
    } catch (error) {
      Alert.alert("Lỗi", "Không thể hủy lịch hẹn. Vui lòng thử lại.");
    }
  };

  const handleViewDetails = (appointment) => {
    navigation.navigate("AppointmentDetail", { appointment });
  };

  const renderAppointment = ({ item }) => {
    const formattedSlot = appointmentService.formatTimeSlot(item);
    const statusInfo = appointmentService.getAppointmentStatus(item.status);
    const canCancel = item.status === "booked" && !formattedSlot.isPast;

    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => handleViewDetails(item)}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.consultantInfo}>
            <Text style={styles.consultantName}>
              {item.consultant?.name || "Chuyên viên tư vấn"}
            </Text>
            <Text style={styles.consultantEmail}>
              {item.consultant?.email || ""}
            </Text>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.timeInfo}>
            <Text style={styles.dateText}>{formattedSlot.formattedDate}</Text>
            <Text style={styles.timeText}>
              {formattedSlot.formattedTimeRange}
            </Text>
            {formattedSlot.isToday && (
              <Text style={styles.todayLabel}>Hôm nay</Text>
            )}
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Ghi chú:</Text>
              <Text style={styles.notesText} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item)}
          >
            <Text style={styles.cancelButtonText}>Hủy lịch hẹn</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải lịch hẹn của bạn...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMyAppointments}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (appointments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Bạn chưa có lịch hẹn nào</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("ConsultantList")}
        >
          <Text style={styles.bookButtonText}>Đặt lịch hẹn</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch hẹn của tôi</Text>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MD,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
  },
  listContainer: {
    paddingBottom: SPACING.LG,
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
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.SM,
  },
  consultantInfo: {
    flex: 1,
    marginRight: SPACING.SM,
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
  appointmentDetails: {
    marginBottom: SPACING.SM,
  },
  timeInfo: {
    marginBottom: SPACING.SM,
  },
  dateText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
  },
  timeText: {
    fontSize: FONT_SIZES.LG,
    color: COLORS.PRIMARY,
    fontWeight: "bold",
    marginTop: SPACING.XS,
  },
  todayLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WARNING,
    fontWeight: "500",
    marginTop: SPACING.XS,
  },
  notesContainer: {
    backgroundColor: COLORS.GRAY_LIGHT,
    padding: SPACING.SM,
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
    marginBottom: SPACING.XS,
  },
  notesText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
  },
  cancelButton: {
    backgroundColor: COLORS.ERROR,
    paddingVertical: SPACING.SM,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: "center",
    marginBottom: SPACING.MD,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: SPACING.MD,
    fontSize: FONT_SIZES.LG,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
  },
  bookButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  bookButtonText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: FONT_SIZES.LG,
  },
});

export default MyAppointmentsScreen;
