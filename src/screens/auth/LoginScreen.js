import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const user = data.data.user;
        const token = data.token; // <-- FIX: get token from top-level

        if (!token) {
          Alert.alert("Lỗi", "Không nhận được token từ server");
          return;
        }

        await login(user, token); // Lưu cả user và token vào context

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        );
      } else {
        Alert.alert("Lỗi", data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      "Thông báo",
      "Tính năng đăng nhập Google chưa hỗ trợ trên mobile."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <Text style={styles.subtitle}>Chào mừng bạn</Text>

      {/* Email Input */}
      <View style={styles.inputGroup}>
        <Icon name="envelope" size={18} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Email của bạn"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Icon name="lock" size={20} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      {/* Forgot password */}
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <Text style={styles.dividerText}>Hoặc</Text>
      </View>

      {/* Google login */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Icon name="google" size={18} color="#1976d2" />
        <Text style={styles.googleText}> Đăng nhập với Google</Text>
      </TouchableOpacity>

      {/* Register link */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.bottomText}>
          Chưa có tài khoản? <Text style={styles.link}>Đăng ký ngay</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#777",
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 40 },
  loginButton: {
    backgroundColor: "#1976d2",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#1976d2",
    marginTop: 10,
    textAlign: "center",
  },
  divider: {
    alignItems: "center",
    marginVertical: 15,
  },
  dividerText: {
    color: "#999",
  },
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  googleText: {
    color: "#1976d2",
    fontWeight: "bold",
    marginLeft: 6,
  },
  bottomText: {
    textAlign: "center",
    color: "#666",
  },
});
