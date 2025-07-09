import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import HeaderTitle from "../../components/titleheader/HeaderTitle";

const { width } = Dimensions.get("window");

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.BLOGS.LIST}`, {
        method: HTTP_METHODS.GET,
      });
      const data = await response.json();
      if (data.status === "success") {
        setBlogs(data.data.data);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải danh sách blog");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("BlogDetail", { blogId: item._id })}
      activeOpacity={0.8}
    >
      {item.imageCover ? (
        <Image
          source={{
            uri: `${BASE_URL.replace("/api/v1", "")}/img/blogs/${item.imageCover}`,
          }}
          style={styles.image}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: "#aaa" }}>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.snippet}>
          {item.content.replace(/<[^>]+>/g, "").slice(0, 60)}...
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <HeaderTitle title="Danh sách Blog" />
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          size="large"
          color="#1976d2"
        />
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              Không có bài viết nào
            </Text>
          }
        />
      )}
    </View>
  );
};

const CARD_HEIGHT = 110;
const CARD_RADIUS = 12;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    minHeight: CARD_HEIGHT,
  },
  image: {
    width: CARD_HEIGHT,
    height: CARD_HEIGHT,
    borderTopLeftRadius: CARD_RADIUS,
    borderBottomLeftRadius: CARD_RADIUS,
    backgroundColor: "#e3e3e3",
  },
  imagePlaceholder: {
    width: CARD_HEIGHT,
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3e3e3",
    borderTopLeftRadius: CARD_RADIUS,
    borderBottomLeftRadius: CARD_RADIUS,
  },
  info: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#222",
  },
  snippet: {
    color: "#666",
    fontSize: 13,
  },
});

export default BlogList;
