import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

import DrugFreeLogo from "../../../assets/images/DrugFreeLogo.png";

const Header = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();

  const handleSearch = () => {
    if (search.trim()) {
      console.log("Searching for:", search);
    }
  };

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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={() => navigation.navigate("Home")}
      >
        <Image source={DrugFreeLogo} style={styles.logo} />
        <Text style={styles.title}>DrugFree</Text>
      </TouchableOpacity>

      <View style={styles.navLinks}>
        <TouchableOpacity onPress={() => navigation.navigate("Courses")}>
          <Text style={styles.link}>Khóa học</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
          <Text style={styles.link}>Tư vấn</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("BlogList")}>
          <Text style={styles.link}>Blog</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Assessment")}>
          <Text style={styles.link}>Kiểm tra</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SurveyList")}>
          <Text style={styles.link}>Khảo sát</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("AboutUs")}>
          <Text style={styles.link}>Về chúng tôi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.searchBox}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm kiếm..."
            style={styles.input}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {user ? (
          <>
            <Text style={styles.welcomeText}>
              Chào, {user.name || user.email}
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutBtn}>Đăng xuất</Text>
            </TouchableOpacity>
          </>
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
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1565c0",
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    borderRadius: 6,
    height: 38,
    elevation: 2,
  },
  input: {
    height: 36,
    width: 130,
    fontSize: 14,
  },
  searchIcon: {
    marginLeft: 6,
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
  logoutBtn: {
    color: "#ffcdd2",
    fontWeight: "bold",
    fontSize: 14,
  },
});
