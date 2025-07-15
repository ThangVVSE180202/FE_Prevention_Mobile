import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { userService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getCurrentUserInProfile();
        setProfile(data.data?.data || data.data?.user || null);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );

  if (!profile)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không thể tải thông tin hồ sơ.</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Hồ sơ</Text>
        <Text style={styles.subtitle}>Thông tin cơ bản ở đây</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderHeader()}
      <View style={styles.avatarBox}>
        <Image
          source={{
            uri: profile.photo
              ? `https://prevention-api-tdt.onrender.com/img/users/${profile.photo}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`,
          }}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.email}>{profile.email}</Text>
      <View style={styles.roleBox}>
        <Text style={styles.role}>
          {profile.role === "member"
            ? "Thành viên"
            : profile.role === "consultant"
              ? "Chuyên viên tư vấn"
              : "Quản trị viên"}
        </Text>
      </View>
      {/* {profile.appointmentProfile && (
        <View style={styles.statusBox}>
          <Text style={styles.strikes}>
            Cảnh cáo: {profile.appointmentProfile.strikes}/3
          </Text>
          {profile.appointmentProfile.isBanned && (
            <Text style={styles.ban}>
              Đang bị khóa đặt lịch đến:{" "}
              {profile.appointmentProfile.banUntil
                ? new Date(
                    profile.appointmentProfile.banUntil
                  ).toLocaleDateString("vi-VN")
                : ""}
            </Text>
          )}
        </View>
      )} */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate("EditProfile", { profile })}
      >
        <Text style={styles.editText}>Chỉnh sửa hồ sơ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: -50,
    marginBottom: 50,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  container: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 32,
    backgroundColor: "#f3f4f6",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  avatarBox: {
    borderWidth: 3,
    borderColor: "#1976d2",
    borderRadius: 80,
    padding: 6,
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#1976d2",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
    marginTop: 8,
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginBottom: 12,
  },
  roleBox: {
    backgroundColor: "#1976d2",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 18,
  },
  role: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 1,
  },
  statusBox: {
    marginTop: 8,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fffbe6",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffe066",
    minWidth: 220,
  },
  strikes: { fontSize: 16, color: "#F59E0B", fontWeight: "bold" },
  ban: { color: "red", marginTop: 4, fontWeight: "bold", fontSize: 15 },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 24,
    elevation: 2,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1,
    textAlign: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 16,
    fontWeight: "bold",
  },
  editBtn: {
    marginTop: 16,
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 24,
    elevation: 2,
  },
});

export default ProfileScreen;
