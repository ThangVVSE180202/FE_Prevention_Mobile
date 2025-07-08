import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import HeaderTitle from "../../components/titleheader/HeaderTitle";

const BlogDetail = () => {
  const { blogId } = useRoute().params;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogDetail();
  }, []);

  const fetchBlogDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}${ENDPOINTS.BLOGS.DETAIL(blogId)}`,
        {
          method: HTTP_METHODS.GET,
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setBlog(data.data.data);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải chi tiết blog");
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
  if (!blog)
    return (
      <Text style={{ textAlign: "center", marginTop: 40 }}>
        Không tìm thấy bài viết
      </Text>
    );

  // Nếu muốn hiển thị ngày, bạn có thể lấy blog.createdAt nếu có từ API
  // const dateStr = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <HeaderTitle title="Blog chi tiết" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {blog.imageCover ? (
          <Image
            source={{
              uri: `${BASE_URL.replace("/api/v1", "")}/img/blogs/${blog.imageCover}`,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ color: "#aaa" }}>No Image</Text>
          </View>
        )}
        <Text style={styles.title}>{blog.title}</Text>
        {/* Nếu có tác giả hoặc ngày đăng */}
        {/* <Text style={styles.meta}>Tác giả: {blog.author?.name || "Ẩn danh"} {dateStr ? `| ${dateStr}` : ""}</Text> */}
        <View style={styles.divider} />
        <Text style={styles.content}>
          {blog.content.replace(/<[^>]+>/g, "")}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -10,
    flex: 1,
  },
  image: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    marginBottom: 18,
    backgroundColor: "#eee",
  },
  imagePlaceholder: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    marginBottom: 18,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 10,
    textAlign: "left",
    lineHeight: 32,
  },
  meta: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e4e4e4",
    marginVertical: 12,
  },
  content: {
    fontSize: 16,
    color: "#222",
    lineHeight: 26,
    textAlign: "justify",
  },
});

export default BlogDetail;
