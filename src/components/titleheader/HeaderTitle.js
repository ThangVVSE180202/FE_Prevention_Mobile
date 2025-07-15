import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const HeaderTitle = ({ title }) => {
  const navigation = useNavigation();
  const isSurveyList = title === "Danh sách khảo sát";

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => {
          if (isSurveyList) {
            navigation.navigate("Main", { screen: "Home" });
          } else {
            navigation.goBack();
          }
        }}
        // style={styles.backBtn}
      >
        <Icon name="arrow-back" size={24} color="#333"/>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: 80,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});

export default HeaderTitle;
