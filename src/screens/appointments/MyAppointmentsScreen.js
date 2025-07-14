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
import { useAuth } from "../../context";

const MyAppointmentsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyAppointments();
    fetchUserProfile();
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

  const fetchUserProfile = async () => {
    try {
      const response = await appointmentService.getUserAppointmentStatus();
      setUserProfile(response.data.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyAppointments();
    fetchUserProfile();
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
      fetchUserProfile(); // Refresh user profile to update strikes/cancellation info
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
    const statusInfo = appointmentService.getAppointmentStatus(
      item.status,
      item.isNoShow
    );
    const canCancel =
      item.status === "booked" && !formattedSlot.isPast && !item.isNoShow;

    // Check if user can cancel based on their current status
    const cancellationLimits = userProfile
      ? appointmentService.getUserCancellationLimits(userProfile)
      : null;
    const canCancelToday = cancellationLimits
      ? cancellationLimits.canCancelToday && !cancellationLimits.isInCooldown
      : true;

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
          <View style={styles.timeInfoContainer}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.dateText}>{formattedSlot.formattedDate}</Text>
              {formattedSlot.isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Hôm nay</Text>
                </View>
              )}
            </View>

            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.timeText}>
                {formattedSlot.formattedTimeRange}
              </Text>
            </View>
          </View>

          {/* Appointment Status Indicators */}
          {item.isNoShow && (
            <View style={styles.noShowWarning}>
              <Ionicons name="warning" size={16} color="#EF4444" />
              <Text style={styles.noShowText}>Đã đánh dấu không đến hẹn</Text>
            </View>
          )}

          {formattedSlot.isPast &&
            !item.isNoShow &&
            item.status === "booked" && (
              <View style={styles.completedInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.completedText}>Đã hoàn thành</Text>
              </View>
            )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {canCancel && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                !canCancelToday && styles.cancelButtonDisabled,
              ]}
              onPress={() => handleCancelAppointment(item)}
              disabled={!canCancelToday}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={canCancelToday ? "#FFFFFF" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.cancelButtonText,
                  !canCancelToday && styles.cancelButtonTextDisabled,
                ]}
              >
                {canCancelToday ? "Hủy lịch hẹn" : "Không thể hủy"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleViewDetails(item)}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#3B82F6"
            />
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
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

        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
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

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Lịch hẹn của tôi</Text>
          <Text style={styles.subtitle}>Quản lý các cuộc hẹn tư vấn</Text>
        </View>
      </View>

      {/* Stats with integrated status */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            <Text style={styles.statsText}>{appointments.length} lịch hẹn</Text>
          </View>

          {userProfile && (
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Cảnh cáo</Text>
                <Text
                  style={[
                    styles.statusValue,
                    appointmentService.getUserStrikesInfo(userProfile)
                      .currentStrikes >= 2
                      ? styles.warningText
                      : styles.normalText,
                  ]}
                >
                  {
                    appointmentService.getUserStrikesInfo(userProfile)
                      .currentStrikes
                  }
                  /3
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Hủy hôm nay</Text>
                <Text
                  style={[
                    styles.statusValue,
                    appointmentService.getUserCancellationLimits(userProfile)
                      .dailyCancellations >= 2
                      ? styles.warningText
                      : styles.normalText,
                  ]}
                >
                  {
                    appointmentService.getUserCancellationLimits(userProfile)
                      .dailyCancellations
                  }
                  /3
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Status warnings if any */}
        {userProfile &&
          (() => {
            const strikesInfo =
              appointmentService.getUserStrikesInfo(userProfile);
            const cancellationLimits =
              appointmentService.getUserCancellationLimits(userProfile);
            const banInfo = appointmentService.formatBanInfo(
              strikesInfo.banUntil
            );
            const cooldownInfo = appointmentService.getCooldownInfo(
              cancellationLimits.cooldownUntil
            );

            if (banInfo) {
              return (
                <View style={styles.inlineWarning}>
                  <Ionicons name="ban" size={16} color="#EF4444" />
                  <Text style={styles.inlineWarningText}>
                    {banInfo.message}
                  </Text>
                </View>
              );
            }

            if (cooldownInfo) {
              return (
                <View style={styles.inlineWarning}>
                  <Ionicons name="time" size={16} color="#F59E0B" />
                  <Text style={styles.inlineWarningText}>
                    {cooldownInfo.message}
                  </Text>
                </View>
              );
            }

            return null;
          })()}
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

  statsContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    gap: 16,
  },
  statusItem: {
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  normalText: {
    color: "#10B981",
  },
  warningText: {
    color: "#F59E0B",
  },
  inlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 6,
    gap: 6,
    marginTop: 8,
  },
  inlineWarningText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
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
  appointmentDetails: {
    marginBottom: 10,
  },
  timeInfoContainer: {
    gap: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  todayBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  todayText: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "600",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  noShowWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  noShowText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
  },
  completedInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 8,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  completedText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "500",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  cancelButtonDisabled: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButtonTextDisabled: {
    color: "#9CA3AF",
  },
  detailButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  detailButtonText: {
    color: "#3B82F6",
    fontSize: 14,
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
