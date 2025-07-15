import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import DrugFreeLogo from "../../../assets/images/DrugFreeLogo.png";

const Header = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo + Title */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate("Home")}
        >
          <Image source={DrugFreeLogo} style={styles.logo} />
          <Text style={styles.title}>DrugFree</Text>
        </TouchableOpacity>

        {/* Navigation Links */}
        <View style={styles.navLinks}>
          <TouchableOpacity onPress={() => navigation.navigate("Courses")}>
            <Text style={styles.link}>Khóa học</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("BlogList")}>
            <Text style={styles.link}>Blog</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SurveyList")}>
            <Text style={styles.link}>Khảo sát</Text>
          </TouchableOpacity>
        </View>

        {/* Login Info */}
        <View style={styles.rightSection}>
          {user ? (
            <View style={styles.userSection}>
              <Text style={styles.welcomeText}>
                Chào, {user.name || user.email}
              </Text>
              {/* Temporary Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginBtn}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupBtn}>Đăng ký</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#1565c0",
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  navLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
    gap: 12,
  },
  link: {
    color: "#e3f2fd",
    fontSize: 16,
    paddingHorizontal: 4,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  welcomeText: {
    color: "#ffffff",
    fontSize: 14,
  },
  loginBtn: {
    color: "#ffffff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  signupBtn: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  logoutButton: {
    backgroundColor: "#e53935",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});
