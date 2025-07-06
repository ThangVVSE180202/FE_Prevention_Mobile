// 👤 Consultant Detail Screen
// Display consultant details and navigate to available slots

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { userService } from "../../services/api";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const ConsultantDetailScreen = ({ route, navigation }) => {
  const { consultant } = route.params;

  const handleViewAvailableSlots = () => {
    navigation.navigate("AvailableSlots", {
      consultantId: consultant._id,
      consultantName: consultant.name,
    });
  };

  const formatUserData = userService.formatUserData(consultant);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{formatUserData.initials}</Text>
        </View>
        <Text style={styles.consultantName}>{consultant.name}</Text>
        <Text style={styles.consultantRole}>{formatUserData.roleName}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{consultant.email}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Ngày tham gia:</Text>
          <Text style={styles.infoValue}>
            {formatUserData.formattedJoinDate}
          </Text>
        </View>
      </View>

      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
        <Text style={styles.description}>
          {consultant.bio ||
            `${consultant.name} là chuyên viên tư vấn có kinh nghiệm trong lĩnh vực phòng ngừa sử dụng ma túy. Sẵn sàng hỗ trợ và tư vấn cho bạn về các vấn đề liên quan đến phòng ngừa và can thiệp sớm.`}
        </Text>
      </View>

      <View style={styles.specialtySection}>
        <Text style={styles.sectionTitle}>Chuyên môn</Text>
        <View style={styles.specialtyContainer}>
          {(
            consultant.specialties || [
              "Tư vấn phòng ngừa",
              "Can thiệp sớm",
              "Hỗ trợ tâm lý",
              "Đánh giá rủi ro",
            ]
          ).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleViewAvailableSlots}
      >
        <Text style={styles.bookButtonText}>Xem lịch khả dụng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.XL,
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.MD,
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XXL,
    fontWeight: "bold",
  },
  consultantName: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
    textAlign: "center",
  },
  consultantRole: {
    fontSize: FONT_SIZES.LG,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: SPACING.SM,
  },
  infoLabel: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
    width: 120,
  },
  infoValue: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  descriptionSection: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  description: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  specialtySection: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  specialtyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specialtyTag: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 16,
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  specialtyText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY_DARK,
    fontWeight: "500",
  },
  bookButton: {
    backgroundColor: COLORS.PRIMARY,
    margin: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
  },
});

export default ConsultantDetailScreen;
