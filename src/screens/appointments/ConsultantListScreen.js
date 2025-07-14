// 👥 Consultant List Screen
// Display list of available consultants for appointment booking

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appointmentService, userService } from "../../services/api";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const ConsultantListScreen = ({ navigation }) => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentService.getConsultants();
      setConsultants(response.data.consultantsList || []);
    } catch (err) {
      setError(err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách chuyên viên tư vấn");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConsultants();
  };

  const handleSelectConsultant = (consultant) => {
    navigation.navigate("ConsultantDetail", { consultant });
  };

  const renderConsultant = ({ item }) => (
    <TouchableOpacity
      style={styles.consultantCard}
      onPress={() => handleSelectConsultant(item)}
    >
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={24} color="#fff" />
      </View>
      <View style={styles.consultantInfo}>
        <Text style={styles.consultantName}>{item.name}</Text>
        <Text style={styles.consultantEmail}>{item.email}</Text>
        <View style={styles.roleContainer}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Chuyên viên tư vấn</Text>
          </View>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <View style={styles.loadingContainer}>
            <Ionicons name="people-outline" size={48} color="#E5E7EB" />
            <Text style={styles.loadingText}>
              Đang tải danh sách chuyên viên...
            </Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Chuyên viên tư vấn</Text>
          <Text style={styles.subtitle}>Chọn chuyên viên để đặt lịch hẹn</Text>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchConsultants}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={consultants}
        renderItem={renderConsultant}
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
          consultants.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading &&
          !error && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="people-outline" size={64} color="#E5E7EB" />
              </View>
              <Text style={styles.emptyTitle}>Không có chuyên viên nào</Text>
              <Text style={styles.emptyText}>
                Hiện tại chưa có chuyên viên tư vấn nào khả dụng
              </Text>
            </View>
          )
        }
      />
      {/* Floating circular button for My Appointments */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate("MyAppointments")}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    position: "absolute",
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    gap: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  consultantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  consultantInfo: {
    flex: 1,
  },
  consultantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  consultantEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  roleContainer: {
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  arrowContainer: {
    padding: 4,
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

export default ConsultantListScreen;
