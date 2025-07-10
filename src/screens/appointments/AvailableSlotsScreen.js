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
} from "react-native";
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
      const slotsData = response.slots || [];

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
      <View style={styles.centerContainer}>
        <Text>Đang tải lịch khả dụng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAvailableSlots}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dateKeys = Object.keys(groupedSlots);

  if (dateKeys.length === 0) {
    return (
      <View style={styles.centerContainer}>
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
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch khả dụng</Text>
      <Text style={styles.subtitle}>{consultantName}</Text>

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
    marginBottom: SPACING.XS,
  },
  subtitle: {
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
  },
  listContainer: {
    paddingBottom: SPACING.LG,
  },
  dateSection: {
    marginBottom: SPACING.LG,
  },
  dateHeader: {
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
    paddingHorizontal: SPACING.SM,
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pastSlot: {
    backgroundColor: COLORS.GRAY_LIGHT,
    opacity: 0.6,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: FONT_SIZES.LG,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  todayLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: "500",
    marginTop: SPACING.XS,
  },
  statusContainer: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
    fontWeight: "500",
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: "center",
    marginBottom: SPACING.MD,
    fontSize: FONT_SIZES.MD,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: SPACING.MD,
    fontSize: FONT_SIZES.MD,
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
});

export default AvailableSlotsScreen;
