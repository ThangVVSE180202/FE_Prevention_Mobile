// 📅 Available Slots Screen
// Display available time slots for a consultant

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

const AvailableSlotsScreen = ({ route, navigation }) => {
  const { consultantId, consultantName } = route.params;
  const [slots, setSlots] = useState([]);
  const [groupedSlots, setGroupedSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableSlots();
  }, [consultantId]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentService.getConsultantSlots(
        consultantId,
        { status: "available" }
      );
      // Fix: Use response.data.slots for correct API structure
      const slotsData =
        response.data && Array.isArray(response.data.slots)
          ? response.data.slots
          : [];

      // Filter only available slots that are not in the past
      const availableSlots = slotsData.filter((slot) => {
        const slotTime = new Date(slot.startTime);
        const now = new Date();
        return slot.status === "available" && slotTime > now;
      });

      setSlots(availableSlots);

      // Group slots by date
      const grouped = appointmentService.groupSlotsByDate(availableSlots);
      setGroupedSlots(grouped);
    } catch (err) {
      console.error("Error fetching available slots:", err);
      setError(err.message);

      let errorMessage = "Không thể tải lịch khả dụng";
      if (err.response?.status === 404) {
        errorMessage = "Chuyên viên này không có lịch khả dụng";
      } else if (err.response?.status === 403) {
        errorMessage = "Bạn không có quyền xem lịch của chuyên viên này";
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvailableSlots();
  };

  const handleSelectSlot = (slot) => {
    navigation.navigate("AppointmentBooking", {
      slot,
      consultantId,
      consultantName,
    });
  };

  const renderSlot = ({ item }) => {
    const formattedSlot = appointmentService.formatTimeSlot(item);
    const statusInfo = appointmentService.getAppointmentStatus(item.status);

    return (
      <TouchableOpacity
        style={[styles.slotCard, formattedSlot.isPast && styles.pastSlot]}
        onPress={() => handleSelectSlot(item)}
        disabled={formattedSlot.isPast}
      >
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formattedSlot.formattedTimeRange}
          </Text>
          {formattedSlot.isToday && (
            <Text style={styles.todayLabel}>Hôm nay</Text>
          )}
        </View>

        <View
          style={[
            styles.statusContainer,
            { backgroundColor: statusInfo.color },
          ]}
        >
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateSection = ({ item: date }) => {
    const slotsForDate = groupedSlots[date];

    return (
      <View style={styles.dateSection}>
        <Text style={styles.dateHeader}>{date}</Text>
        <FlatList
          data={slotsForDate}
          renderItem={renderSlot}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <Ionicons name="time-outline" size={48} color="#9CA3AF" />
          <Text style={styles.loadingText}>Đang tải khung giờ...</Text>
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
            onPress={fetchAvailableSlots}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dateKeys = Object.keys(groupedSlots);

  if (dateKeys.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {consultantName} hiện tại không có lịch khả dụng
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAvailableSlots}
          >
            <Text style={styles.retryText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.title}>Khung giờ khả dụng</Text>
          <Text style={styles.subtitle}>
            {consultantName
              ? `Với ${consultantName}`
              : "Chọn khung giờ phù hợp"}
          </Text>
        </View>
      </View>

      {/* Stats Container */}
      <View style={styles.statsContainer}>
        <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
        <Text style={styles.statsText}>
          {Object.keys(groupedSlots).reduce(
            (total, date) => total + groupedSlots[date].length,
            0
          )}{" "}
          khung giờ khả dụng
        </Text>
      </View>

      <FlatList
        data={dateKeys}
        renderItem={renderDateSection}
        keyExtractor={(item) => item}
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
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  pastSlot: {
    backgroundColor: "#F9FAFB",
    opacity: 0.6,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  todayLabel: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
    marginTop: 4,
  },
  statusContainer: {
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
});

export default AvailableSlotsScreen;
