import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";
import HeaderTitle from "../../components/titleheader/HeaderTitle";

const SurveyDetail = () => {
  const { surveyId } = useRoute().params;
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}${ENDPOINTS.SURVEYS.DETAIL(surveyId)}`,
        {
          method: HTTP_METHODS.GET,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setSurvey(data.data.data);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải chi tiết khảo sát");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
    setLoading(false);
  };

  if (loading)
    return (
      <ActivityIndicator
        style={{ marginTop: 40 }}
        size="large"
        color="#1976d2"
      />
    );
  if (!survey) return <Text>Không tìm thấy khảo sát</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <HeaderTitle title="Chi tiết khảo sát" />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{survey.name}</Text>
        <Text style={styles.desc}>{survey.description}</Text>
        {survey.questions.map((q, idx) => (
          <View key={idx} style={styles.questionBlock}>
            <Text style={styles.questionText}>
              {idx + 1}. {q.text}
            </Text>
            {q.options.map((opt, oidx) => (
              <Text key={oidx} style={styles.optionText}>
                - {opt.text} (Điểm: {opt.score})
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  desc: { color: "#666", marginBottom: 16 },
  questionBlock: { marginBottom: 20 },
  questionText: { fontWeight: "bold", marginBottom: 6 },
  optionText: { marginLeft: 10, color: "#555" },
});

export default SurveyDetail;
