import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";
import HeaderTitle from "../../components/titleheader/HeaderTitle";

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState([]); // ID các khảo sát đã làm
  const navigation = useNavigation();
  const { token } = useAuth();

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Gọi lại khi submit thành công (có thể truyền callback hoặc dùng navigation params)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSurveys();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.SURVEYS.LIST}`, {
        method: HTTP_METHODS.GET,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === "success") {
        setSurveys(data.data.data);
        // Nếu API có trả về trạng thái đã làm, hãy lấy ở đây. Nếu không, bạn cần lưu trạng thái local hoặc hỏi backend.
        // Ví dụ: setCompletedIds(data.data.completedSurveyIds || []);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải khảo sát");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.surveyCard}>
      <Text style={styles.surveyTitle}>{item.name}</Text>
      <Text style={styles.surveyDesc}>{item.description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() =>
            navigation.navigate("SurveyDetail", { surveyId: item._id })
          }
        >
          <Text style={styles.detailText}>Xem chi tiết</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.doBtn}
          onPress={() =>
            navigation.navigate("SurveySubmit", { surveyId: item._id })
          }
          disabled={completedIds.includes(item._id)}
        >
          <Text style={styles.doText}>
            {completedIds.includes(item._id) ? "Đã hoàn thành" : "Làm khảo sát"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator
        style={{ marginTop: 40 }}
        size="large"
        color="#1976d2"
      />
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <HeaderTitle title="Danh sách khảo sát" />
      <FlatList
        data={surveys}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text>Không có khảo sát nào</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  surveyCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  surveyTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 4 },
  surveyDesc: { color: "#666", marginBottom: 12 },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  detailBtn: { padding: 8 },
  doBtn: { backgroundColor: "#1976d2", borderRadius: 5, padding: 8 },
  detailText: { color: "#1976d2" },
  doText: { color: "#fff" },
});

export default SurveyList;
