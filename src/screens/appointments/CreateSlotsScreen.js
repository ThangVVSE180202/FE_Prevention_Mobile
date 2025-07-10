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
  const [tempDate, setTempDate] = useState(new Date());
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

  // No longer used: onDateChange

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

      // API expects { slots: [...] }
      await appointmentService.createTimeSlots({ slots: slotsToCreate });

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
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Tạo khung giờ mới</Text>
            <Text style={styles.subtitle}>Thiết lập lịch tư vấn của bạn</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Chọn ngày</Text>
          </View>

          <TouchableOpacity
            style={styles.dateButtonModern}
            activeOpacity={0.8}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar"
              size={22}
              color="#3B82F6"
              style={{ marginRight: 12 }}
            />
            <Text style={styles.dateButtonTextModern}>
              {selectedDate.toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                marginTop: 12,
                padding: 8,
                elevation: 2,
              }}
            >
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  if (Platform.OS === "android") {
                    if (event.type === "set" && date) {
                      setTempDate(date);
                    }
                  } else {
                    if (date) setTempDate(date);
                  }
                }}
                minimumDate={new Date()}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    marginRight: 8,
                    borderRadius: 8,
                    backgroundColor: "#E5E7EB",
                  }}
                  onPress={() => {
                    setShowDatePicker(false);
                    setTempDate(selectedDate);
                  }}
                >
                  <Text style={{ color: "#374151", fontWeight: "600" }}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 8,
                    backgroundColor: "#3B82F6",
                  }}
                  onPress={() => {
                    setShowDatePicker(false);
                    setSelectedDate(tempDate);
                    generateSlotsForDate(tempDate);
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Xác nhận
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
    alignItems: "flex-end",
    minHeight: 88,
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 0,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
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
  dateButtonModern: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dateButtonTextModern: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  slotsGrid: {
    // Individual slot items have their own spacing
  },
  slotItem: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
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
