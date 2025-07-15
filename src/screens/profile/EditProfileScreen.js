import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";

const EditProfileScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const { profile } = route.params;
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [photo, setPhoto] = useState(profile.photo || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://prevention-api-tdt.onrender.com/api/v1/users/update-me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, photo }),
      });
      const data = await res.json();
      if (data.status === "success") {
        Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", data.message || "Cập nhật thất bại");
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật hồ sơ</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Link ảnh đại diện"
        value={photo}
        onChangeText={setPhoto}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu thay đổi</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#1976d2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default EditProfileScreen;