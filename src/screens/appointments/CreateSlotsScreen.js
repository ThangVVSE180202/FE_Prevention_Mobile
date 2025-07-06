// 📅 Create Slots Screen (Consultant only)
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { appointmentService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const CreateSlotsScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.role !== "consultant") {
      Alert.alert("Lỗi", "Bạn không có quyền truy cập trang này");
      navigation.goBack();
      return;
    }
  }, []);

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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn ngày</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {selectedDate.toLocaleDateString("vi-VN")}
          </Text>
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

      {slots.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chọn khung giờ ({selectedSlotsCount} đã chọn)
          </Text>

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
            </TouchableOpacity>
          ))}
        </View>
      )}

      {slots.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (loading || selectedSlotsCount === 0) &&
                styles.createButtonDisabled,
            ]}
            onPress={handleCreateSlots}
            disabled={loading || selectedSlotsCount === 0}
          >
            <Text style={styles.createButtonText}>
              {loading ? "Đang tạo..." : `Tạo ${selectedSlotsCount} khung giờ`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {slots.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Vui lòng chọn ngày để xem khung giờ có thể tạo
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dateButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "bold",
  },
  slotItem: {
    backgroundColor: "#f5f5f5",
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  slotItemSelected: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: "center",
  },
  slotTextSelected: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default CreateSlotsScreen;
