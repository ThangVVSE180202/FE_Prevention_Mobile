import React, { useEffect, useState, useContext } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { getUserById } from "../../services/api/userService";

const ProfileScreen = () => {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserById(user._id, token);
        console.log("getUserById result:", data);
        setProfile(data.data.user);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);
  console.log("ProfileScreen loaded");
  console.log("user:", user, "token:", token);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!profile)
    return (
      <View style={styles.container}>
        <Text>Không thể tải thông tin hồ sơ.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: profile.photo
            ? `https://prevention-api-tdt.onrender.com/img/users/${profile.photo}`
            : "https://ui-avatars.com/api/?name=" + profile.name,
        }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.email}>{profile.email}</Text>
      <Text style={styles.role}>Vai trò: {profile.role}</Text>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  email: { fontSize: 16, color: "#555", marginBottom: 4 },
  role: { fontSize: 16, color: "#888" },
});


