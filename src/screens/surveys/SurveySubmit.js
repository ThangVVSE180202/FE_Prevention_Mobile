import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import { useAuth } from "../../context/AuthContext";
import HeaderTitle from "../../components/titleheader/HeaderTitle";

const SurveySubmit = () => {
  const { surveyId } = useRoute().params;
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
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
        setAnswers(new Array(data.data.data.questions.length).fill(null));
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải khảo sát");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
    setLoading(false);
  };

  const selectOption = (qIdx, oIdx) => {
    const newAns = [...answers];
    newAns[qIdx] = oIdx;
    setAnswers(newAns);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      Alert.alert("Thông báo", "Vui lòng trả lời hết tất cả câu hỏi!");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(
        `${BASE_URL}${ENDPOINTS.SURVEYS.SUBMIT(surveyId)}`,
        {
          method: HTTP_METHODS.POST,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: answers.map((optionIndex, questionIndex) => ({
              questionIndex,
              optionIndex,
            })),
          }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        // Chuyển sang trang kết quả, truyền kết quả vừa nhận được
        navigation.replace("SurveyResult", {
          result: data.data.result,
          surveyName: survey.name,
        });
      } else {
        Alert.alert("Lỗi", data.message || "Nộp khảo sát thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
    setSubmitting(false);
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
      <HeaderTitle title="Khảo sát" />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{survey.name}</Text>
        {survey.questions.map((q, qIdx) => (
          <View key={qIdx} style={styles.questionBlock}>
            <Text style={styles.questionText}>
              {qIdx + 1}. {q.text}
            </Text>
            {q.options.map((opt, oIdx) => (
              <TouchableOpacity
                key={oIdx}
                style={[
                  styles.optionBtn,
                  answers[qIdx] === oIdx && styles.selectedOption,
                ]}
                onPress={() => selectOption(qIdx, oIdx)}
              >
                <Text
                  style={{ color: answers[qIdx] === oIdx ? "#1976d2" : "#333" }}
                >
                  {opt.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={{ color: "#fff" }}>
            {submitting ? "Đang nộp..." : "Nộp khảo sát"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  questionBlock: { marginBottom: 20 },
  questionText: { fontWeight: "bold", marginBottom: 6 },
  optionBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 6,
  },
  selectedOption: { borderColor: "#1976d2", backgroundColor: "#e3f2fd" },
  submitBtn: {
    backgroundColor: "#1976d2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
});

export default SurveySubmit;
