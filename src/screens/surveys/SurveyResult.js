import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import HeaderTitle from "../../components/titleheader/HeaderTitle";

const SurveyResult = () => {
  const { result, surveyName } = useRoute().params;
  const navigation = useNavigation();

  if (!result)
    return (
      <Text style={{ textAlign: "center", marginTop: 40 }}>
        Không có dữ liệu kết quả
      </Text>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <HeaderTitle title="Kết quả khảo sát" />
      <ScrollView style={styles.container}>
        <Text style={styles.surveyName}>{surveyName}</Text>
        <Text style={styles.resultTitle}>Điểm số: {result.totalScore}</Text>
        <Text style={styles.recommend}>{result.recommendation}</Text>
        <View style={styles.answersSection}>
          <Text style={styles.answersTitle}>Chi tiết câu trả lời:</Text>
          {result.answer.map((item, idx) => (
            <View key={idx} style={styles.answerItem}>
              <Text style={styles.questionText}>{item.questionText}</Text>
              <Text style={styles.optionText}>
                Đáp án: {item.chosenOptionText} | Điểm: {item.score}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("SurveyList")}
        >
          <Text style={{ color: "#fff" }}>Quay lại danh sách khảo sát</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  surveyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 8,
  },
  resultTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  recommend: { color: "#555", marginBottom: 20 },
  answersSection: { marginBottom: 18 },
  answersTitle: { fontWeight: "bold", marginBottom: 8 },
  answerItem: {
    marginBottom: 10,
    backgroundColor: "#f1f7ff",
    borderRadius: 6,
    padding: 8,
  },
  questionText: { color: "#333" },
  optionText: { color: "#1976d2", fontSize: 13 },
  backBtn: {
    backgroundColor: "#1976d2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
});

export default SurveyResult;
