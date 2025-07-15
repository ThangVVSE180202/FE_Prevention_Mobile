// 📅 My Time Slots Screen (Consultant only)
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
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
      // Filter out slots whose endTime is in the past
      const now = new Date();
      const filteredSlots = (response.data?.slots || []).filter(
        (slot) => new Date(slot.endTime) > now
      );
      setSlots(filteredSlots);
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
      "Bạn có chắc chắn thành viên này không đến hẹn? Thành viên sẽ nhận 2 cảnh cáo và có thể bị khóa tài khoản nếu đạt 3 cảnh cáo.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await appointmentService.markNoShow(slotId);

              // Show detailed response with user status
              let message = "Đã đánh dấu thành viên không đến hẹn";
              if (response.data?.userStatus) {
                const userStatus = response.data.userStatus;
                message += `\n\nThành viên hiện có ${userStatus.strikes}/3 cảnh cáo`;

                if (userStatus.isBanned) {
                  message +=
                    "\n⚠️ Thành viên đã bị khóa tài khoản do quá nhiều cảnh cáo";
                }
              }

              Alert.alert("Thành công", message);
              fetchMySlots();
            } catch (error) {
              console.error("Error marking no-show:", error);

              let errorMessage = "Không thể đánh dấu không đến hẹn";
              if (error.response?.status === 400) {
                errorMessage =
                  "Slot này đã được đánh dấu no-show rồi hoặc chưa đến thời gian hẹn";
              } else if (error.response?.status === 403) {
                errorMessage =
                  "Bạn chỉ có thể đánh dấu no-show cho slot của mình";
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
            await appointmentService.deleteSlot(slotId);
            Alert.alert("Thành công", "Đã xóa khung giờ");
            fetchMySlots();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa khung giờ");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "#10B981",
      booked: "#3B82F6",
      completed: "#8B5CF6",
      cancelled: "#EF4444",
      no_show: "#F59E0B",
    };
    return colors[status] || "#6B7280";
  };

  const getStatusText = (status) => {
    const texts = {
      available: "Có sẵn",
      booked: "Đã đặt",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      no_show: "Không đến",
    };
    return texts[status] || status;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateLabel;
    if (date.toDateString() === today.toDateString()) {
      dateLabel = "Hôm nay";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = "Ngày mai";
    } else {
      dateLabel = date.toLocaleDateString("vi-VN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { date: dateLabel, time };
  };

  const renderSlot = ({ item }) => {
    const startDateTime = formatDateTime(item.startTime);
    const endDateTime = formatDateTime(item.endTime);
    const statusColor = getStatusColor(item.status);
    const canMarkNoShow =
      item.status === "booked" && new Date(item.endTime) < new Date();

    // Calculate duration
    const durationMs = new Date(item.endTime) - new Date(item.startTime);
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    return (
      <View style={styles.slotCard}>
        {/* Header with date and status */}
        <View style={styles.slotHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{startDateTime.date}</Text>
            <Text style={styles.timeText}>
              {startDateTime.time} - {endDateTime.time}
            </Text>
            <Text style={styles.durationText}>{durationMinutes} phút</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        {/* Member Info for booked slots */}
        {item.member && item.status === "booked" && (
          <View style={styles.memberSection}>
            <View style={styles.memberHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {item.member.name || "Thành viên"}
                </Text>
                {item.member.email && (
                  <Text style={styles.memberEmail}>{item.member.email}</Text>
                )}
                {item.member.phone && (
                  <Text style={styles.memberPhone}>{item.member.phone}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="call-outline" size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes */}
        {item.notes && (
          <View style={styles.notesSection}>
            <View style={styles.notesHeader}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color="#6B7280"
              />
              <Text style={styles.notesLabel}>Ghi chú từ thành viên</Text>
            </View>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {/* Created/Updated info */}
        <View style={styles.timestampSection}>
          <Text style={styles.timestampText}>
            Tạo lúc: {new Date(item.createdAt).toLocaleString("vi-VN")}
          </Text>
          {item.updatedAt !== item.createdAt && (
            <Text style={styles.timestampText}>
              Cập nhật: {new Date(item.updatedAt).toLocaleString("vi-VN")}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        {(item.status === "available" || canMarkNoShow) && (
          <View style={styles.actionButtons}>
            {item.status === "available" && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSlot(item._id)}
              >
                <Ionicons name="trash-outline" size={14} color="#fff" />
                <Text style={styles.buttonText}>Xóa</Text>
              </TouchableOpacity>
            )}

            {canMarkNoShow && (
              <TouchableOpacity
                style={styles.noShowButton}
                onPress={() => handleMarkNoShow(item._id)}
              >
                <Ionicons name="close-circle-outline" size={14} color="#fff" />
                <Text style={styles.buttonText}>Không đến</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <View style={styles.loadingContainer}>
            <Ionicons name="time-outline" size={48} color="#E5E7EB" />
            <Text style={styles.loadingText}>Đang tải khung giờ...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Khung giờ của tôi</Text>
            <Text style={styles.subtitle}>
              Quản lý lịch tư vấn chuyên nghiệp
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateSlots}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.createButtonText}>Tạo mới</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Slots List */}
      <FlatList
        data={slots}
        renderItem={renderSlot}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          slots.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={64} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có khung giờ nào</Text>
            <Text style={styles.emptySubtitle}>
              Tạo khung giờ đầu tiên để bắt đầu nhận lịch hẹn tư vấn từ thành
              viên
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateSlots}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Tạo khung giờ đầu tiên</Text>
            </TouchableOpacity>
          </View>
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
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
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
    // No longer used, kept for compatibility
  },
  titleContainer: {
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
  createButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    gap: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  slotCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  memberSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: "#6B7280",
  },
  memberPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  notesSection: {
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  notesText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    fontStyle: "italic",
  },
  durationText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500",
    marginTop: 2,
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  timestampSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  timestampText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  noShowButton: {
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default MySlotsScreen;
