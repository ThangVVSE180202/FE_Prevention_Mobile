// 📅 Create Time Slots Screen (Consultant only)
// For consultants to create new available time slots

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { appointmentService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const CreateSlotsScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Debug: Log user object and role on mount and when user changes
  React.useEffect(() => {
    console.log("[CreateSlotsScreen] user:", user);
    if (!user) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      navigation.goBack();
      return;
    }
    if (user?.role !== "consultant") {
      Alert.alert("Lỗi", "Bạn không có quyền truy cập trang này");
      navigation.goBack();
      return;
    }
  }, [user]);

  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      generateSlotsForDate(date);
    }
  };

  const generateSlotsForDate = (date) => {
    // Generate default slots from 9 AM to 5 PM, 1-hour duration
    const generatedSlots = appointmentService.generateDaySlots(date, 9, 17, 60);
    setSlots(generatedSlots.map((slot) => ({ ...slot, selected: false })));
  };

  const toggleSlotSelection = (index) => {
    const updatedSlots = [...slots];
    updatedSlots[index].selected = !updatedSlots[index].selected;
    setSlots(updatedSlots);
  };

  const handleCreateSlots = async () => {
    const selectedSlots = slots.filter((slot) => slot.selected);

    if (selectedSlots.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một khung giờ");
      return;
    }

    // Validate slots
    const validationErrors = [];
    selectedSlots.forEach((slot) => {
      const errors = appointmentService.validateTimeSlot(slot);
      validationErrors.push(...errors);
    });

    if (validationErrors.length > 0) {
      Alert.alert("Lỗi", validationErrors[0]);
      return;
    }

    setLoading(true);
    try {
      const slotsToCreate = selectedSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));

      await appointmentService.createTimeSlots(slotsToCreate);

      Alert.alert("Thành công", "Đã tạo khung giờ thành công!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tạo khung giờ");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (slot) => {
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);

    return `${startTime.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endTime.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const selectedSlotsCount = slots.filter((slot) => slot.selected).length;

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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Tạo khung giờ mới</Text>
          <Text style={styles.headerSubtitle}>
            Thiết lập lịch tư vấn của bạn
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Chọn ngày</Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Time Slots Selection */}
        {slots.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>
                Chọn khung giờ ({selectedSlotsCount} đã chọn)
              </Text>
            </View>

            <Text style={styles.sectionDescription}>
              Chọn các khung giờ bạn muốn mở cho thành viên đặt lịch tư vấn
            </Text>

            <View style={styles.slotsGrid}>
              {slots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.slotItem,
                    slot.selected && styles.slotItemSelected,
                  ]}
                  onPress={() => toggleSlotSelection(index)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      slot.selected && styles.slotTextSelected,
                    ]}
                  >
                    {formatTimeSlot(slot)}
                  </Text>
                  {slot.selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#3B82F6"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Summary & Create Button */}
        {slots.length > 0 && (
          <View style={styles.section}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#059669"
                />
                <Text style={styles.summaryTitle}>Tóm tắt</Text>
              </View>
              <Text style={styles.summaryText}>
                Bạn đang tạo {selectedSlotsCount} khung giờ cho ngày{" "}
                {selectedDate.toLocaleDateString("vi-VN")}
              </Text>
              {selectedSlotsCount > 0 && (
                <Text style={styles.summaryNote}>
                  Các khung giờ này sẽ có sẵn để thành viên đặt lịch tư vấn
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                (loading || selectedSlotsCount === 0) &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleCreateSlots}
              disabled={loading || selectedSlotsCount === 0}
            >
              {loading ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.createButtonText}>Đang tạo...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.createButtonText}>
                    Tạo {selectedSlotsCount} khung giờ
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {slots.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="time-outline" size={64} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>Chọn ngày để bắt đầu</Text>
            <Text style={styles.emptyText}>
              Vui lòng chọn một ngày để xem các khung giờ có thể tạo
            </Text>
          </View>
        )}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  dateButton: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
    marginLeft: 12,
  },
  slotsGrid: {
    gap: 12,
  },
  slotItem: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slotItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  slotText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  slotTextSelected: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  summaryText: {
    fontSize: 15,
    color: "#065F46",
    marginBottom: 8,
    lineHeight: 22,
  },
  summaryNote: {
    fontSize: 13,
    color: "#047857",
    fontStyle: "italic",
  },
  createButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default CreateSlotsScreen;
