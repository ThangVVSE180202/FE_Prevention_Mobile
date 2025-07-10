// 👤 Consultant Detail Screen
// Display consultant details and navigate to available slots

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "../../services/api";

const ConsultantDetailScreen = ({ route, navigation }) => {
  const { consultant } = route.params;

  const handleViewAvailableSlots = () => {
    navigation.navigate("AvailableSlots", {
      consultantId: consultant._id,
      consultantName: consultant.name,
    });
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
    });
  };

  const getSpecialties = () => {
    return (
      consultant.specialties || [
        "Tư vấn phòng ngừa",
        "Can thiệp sớm",
        "Hỗ trợ tâm lý",
        "Đánh giá rủi ro",
      ]
    );
  };

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
          <Text style={styles.title}>Thông tin chuyên viên</Text>
          <Text style={styles.subtitle}>Chi tiết và lịch khả dụng</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.consultantName}>{consultant.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Chuyên viên tư vấn</Text>
            </View>
          </View>
        </View>

        {/* Contact Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{consultant.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tham gia từ:</Text>
              <Text style={styles.infoValue}>
                {formatJoinDate(consultant.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="document-text" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Giới thiệu</Text>
          </View>
          <Text style={styles.description}>
            {consultant.bio ||
              `${consultant.name} là chuyên viên tư vấn có kinh nghiệm trong lĩnh vực phòng ngừa sử dụng ma túy. Sẵn sàng hỗ trợ và tư vấn cho bạn về các vấn đề liên quan đến phòng ngừa và can thiệp sớm.`}
          </Text>
        </View>

        {/* Specialties Card */}
        <View style={styles.specialtyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="star" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Chuyên môn</Text>
          </View>
          <View style={styles.specialtyContainer}>
            {getSpecialties().map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Book Appointment Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleViewAvailableSlots}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Xem lịch khả dụng</Text>
        </TouchableOpacity>
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
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: "center",
  },
  consultantName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  description: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  specialtyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  specialtyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  specialtyText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  bookButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ConsultantDetailScreen;
