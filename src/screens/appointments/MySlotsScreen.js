// 📅 My Slots Screen (Consultant only)
// For consultants to view and manage their own time slots

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
import { useAuth } from "../../context/AuthContext";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const MySlotsScreen = ({ navigation }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== "consultant") {
      Alert.alert("Lỗi", "Bạn không có quyền truy cập trang này");
      navigation.goBack();
      return;
    }
    fetchMySlots();
  }, []);

  const fetchMySlots = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: You may need to implement this endpoint or use a different one
      // const response = await appointmentService.getMySlots();
      // setSlots(response.data.slots || []);

      // For now, using empty array until the endpoint is implemented
      setSlots([]);
    } catch (err) {
      setError(err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách khung giờ của bạn");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMySlots();
    setRefreshing(false);
  };

  const handleCreateSlots = () => {
    navigation.navigate("CreateSlots");
  };

  const handleDeleteSlot = async (slotId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa khung giờ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            // Implement delete slot API call
            // await appointmentService.deleteSlot(slotId);
            Alert.alert("Thành công", "Đã xóa khung giờ");
            fetchMySlots();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa khung giờ");
          }
        },
      },
    ]);
  };

  const renderSlot = ({ item }) => {
    const formatted = appointmentService.formatTimeSlot(item);
    const statusInfo = appointmentService.getAppointmentStatus(item.status);

    return (
      <View style={styles.slotCard}>
        <View style={styles.slotHeader}>
          <Text style={styles.slotDate}>{formatted.formattedDate}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        <Text style={styles.slotTime}>{formatted.formattedTimeRange}</Text>

        {item.status === "available" && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSlot(item._id)}
          >
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Khung giờ của tôi</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateSlots}
        >
          <Text style={styles.createButtonText}>Tạo khung giờ</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={slots}
        renderItem={renderSlot}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bạn chưa tạo khung giờ nào</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateSlots}
            >
              <Text style={styles.createButtonText}>
                Tạo khung giờ đầu tiên
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={slots.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.text,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: FONT_SIZES.sm,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 8,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
  },
  slotCard: {
    backgroundColor: "#fff",
    margin: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  slotDate: {
    fontSize: FONT_SIZES.md,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: FONT_SIZES.xs,
    fontWeight: "bold",
  },
  slotTime: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: FONT_SIZES.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  emptyList: {
    flex: 1,
  },
});

export default MySlotsScreen;
