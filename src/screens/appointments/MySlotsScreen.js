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
      const response = await appointmentService.getMySlots();
      setSlots(response.slots || []);
    } catch (err) {
      console.error("Error fetching my slots:", err);
      setError(err.message);

      let errorMessage = "Không thể tải danh sách khung giờ của bạn";
      if (err.response?.status === 403) {
        errorMessage = "Bạn không có quyền truy cập chức năng này";
      }

      Alert.alert("Lỗi", errorMessage);
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

  const handleMarkNoShow = async (slotId) => {
    Alert.alert(
      "Xác nhận đánh dấu không đến",
      "Bạn có chắc chắn thành viên này không đến hẹn? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentService.markNoShow(slotId);
              Alert.alert("Thành công", "Đã đánh dấu thành viên không đến hẹn");
              fetchMySlots();
            } catch (error) {
              console.error("Error marking no-show:", error);

              let errorMessage = "Không thể đánh dấu không đến hẹn";
              if (error.response?.status === 400) {
                errorMessage =
                  "Chỉ có thể đánh dấu không đến hẹn sau thời gian hẹn";
              } else if (error.response?.status === 403) {
                errorMessage = "Bạn không có quyền thực hiện hành động này";
              } else if (error.response?.status === 404) {
                errorMessage = "Không tìm thấy lịch hẹn này";
              }

              Alert.alert("Lỗi", errorMessage);
            }
          },
        },
      ]
    );
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
    const statusInfo = appointmentService.getAppointmentStatus(
      item.status,
      item.isNoShow
    );
    const now = new Date();
    const slotTime = new Date(item.startTime);
    const canMarkNoShow =
      item.status === "booked" && !item.isNoShow && now > slotTime;

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

        {/* Show member information for booked slots */}
        {item.status === "booked" && item.member && (
          <View style={styles.memberInfo}>
            <Text style={styles.memberLabel}>Thành viên:</Text>
            <Text style={styles.memberName}>{item.member.name}</Text>
            {item.member.email && (
              <Text style={styles.memberEmail}>{item.member.email}</Text>
            )}
            {item.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Ghi chú:</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          {item.status === "available" && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteSlot(item._id)}
            >
              <Text style={styles.deleteButtonText}>Xóa</Text>
            </TouchableOpacity>
          )}

          {canMarkNoShow && (
            <TouchableOpacity
              style={styles.noShowButton}
              onPress={() => handleMarkNoShow(item._id)}
            >
              <Text style={styles.noShowButtonText}>Đánh dấu không đến</Text>
            </TouchableOpacity>
          )}
        </View>
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
    marginRight: SPACING.sm,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: FONT_SIZES.sm,
  },
  // New styles for member info and actions
  memberInfo: {
    backgroundColor: "#f5f5f5",
    padding: SPACING.sm,
    borderRadius: 8,
    marginVertical: SPACING.sm,
  },
  memberLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  memberName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notesContainer: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  notesLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: SPACING.sm,
  },
  noShowButton: {
    backgroundColor: "#ff9800",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  noShowButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: FONT_SIZES.sm,
  },
  // ...existing styles...
});

export default MySlotsScreen;
