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
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
      const response = await appointmentService.getMyBookings();
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
      const response =
        await appointmentService.cancelAppointmentSlot(appointmentId);
      Alert.alert("Thành công", response.message || "Lịch hẹn đã được hủy");
      fetchMyAppointments(); // Refresh the list
    } catch (error) {
      const errorInfo = appointmentService.handleCancelError(error);

      switch (errorInfo.type) {
        case "daily_limit":
          Alert.alert("Hết lượt hủy", errorInfo.message);
          break;
        case "cooldown":
          Alert.alert(
            "Cần chờ",
            `Bạn cần đợi ${errorInfo.hours} giờ ${errorInfo.minutes} phút nữa để có thể hủy lịch tiếp theo`
          );
          break;
        case "unauthorized":
          Alert.alert("Không có quyền", "Bạn chỉ có thể hủy lịch hẹn của mình");
          break;
        default:
          Alert.alert(
            "Lỗi",
            errorInfo.message || "Không thể hủy lịch hẹn. Vui lòng thử lại."
          );
      }
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <Ionicons name="time-outline" size={48} color="#9CA3AF" />
          <Text style={styles.loadingText}>Đang tải lịch hẹn của bạn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchMyAppointments}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Lịch hẹn của tôi</Text>
            <Text style={styles.subtitle}>Quản lý các cuộc hẹn tư vấn</Text>
          </View>
        </View>

        <View style={styles.centerContainer}>
          <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Bạn chưa có lịch hẹn nào</Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate("ConsultantList")}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Đặt lịch hẹn</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Lịch hẹn của tôi</Text>
          <Text style={styles.subtitle}>Quản lý các cuộc hẹn tư vấn</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
        <Text style={styles.statsText}>{appointments.length} lịch hẹn</Text>
      </View>

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
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 32,
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
  statsContainer: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  consultantInfo: {
    flex: 1,
    marginRight: 16,
  },
  consultantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  consultantEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
    marginTop: 16,
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default MyAppointmentsScreen;
