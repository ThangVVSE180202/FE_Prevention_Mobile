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
} from "react-native";
import { appointmentService } from "../../services/api";
import { COLORS, SPACING, FONT_SIZES } from "../../constants";

const ConsultantListScreen = ({ navigation }) => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
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
    }
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
        <Text style={styles.avatarText}>
          {userService.getInitials(item.name)}
        </Text>
      </View>
      <View style={styles.consultantInfo}>
        <Text style={styles.consultantName}>{item.name}</Text>
        <Text style={styles.consultantEmail}>{item.email}</Text>
        <Text style={styles.consultantRole}>
          {userService.getRoleName(item.role)}
        </Text>
      </View>
      <Text style={styles.arrowText}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải danh sách chuyên viên...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchConsultants}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chuyên viên tư vấn</Text>
      <Text style={styles.subtitle}>Chọn chuyên viên để đặt lịch hẹn</Text>

      <FlatList
        data={consultants}
        renderItem={renderConsultant}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
  },
  title: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
  },
  listContainer: {
    paddingBottom: SPACING.LG,
  },
  consultantCard: {
    flexDirection: "row",
    alignItems: "center",
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
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.MD,
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
  },
  consultantInfo: {
    flex: 1,
  },
  consultantName: {
    fontSize: FONT_SIZES.LG,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  consultantEmail: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  consultantRole: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  arrowText: {
    fontSize: FONT_SIZES.XXL,
    color: COLORS.GRAY,
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: "center",
    marginBottom: SPACING.MD,
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

export default ConsultantListScreen;
