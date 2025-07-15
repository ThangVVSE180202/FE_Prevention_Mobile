import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { courseService } from "../../services/api";
import { favoriteStorage } from "../../utils";
import { useAuth } from "../../context/AuthContext";

const FavoriteCourseScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavoriteCourses();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFavoriteCourses();
    });

    return unsubscribe;
  }, [navigation]);

  const loadFavoriteCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const favoriteIds = await favoriteStorage.getFavorites();
      setFavoriteIds(favoriteIds);

      if (favoriteIds.length === 0) {
        setFavoriteCourses([]);
        return;
      }

      const coursePromises = favoriteIds.map(async (courseId) => {
        try {
          const response = await courseService.getCourseById(courseId);
          return response.data?.data || response.data?.course || response.data;
        } catch (error) {
          console.warn(`Failed to fetch course ${courseId}:`, error);
          return null;
        }
      });

      const courses = await Promise.all(coursePromises);
      const validCourses = courses.filter((course) => course && course._id);

      setFavoriteCourses(validCourses);

      if (validCourses.length !== favoriteIds.length) {
        const validIds = validCourses.map((course) => course._id);
        await favoriteStorage.clearAllFavorites();
        for (const id of validIds) {
          await favoriteStorage.addFavorite(id);
        }
        setFavoriteIds(validIds);
      }
    } catch (err) {
      console.log("Error loading favorite courses:", err);
      setError(err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách khóa học yêu thích");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavoriteCourses();
  };

  const handleRemoveFromFavorites = async (courseId, courseName) => {
    Alert.alert(
      "Xóa khỏi yêu thích",
      `Bạn có chắc muốn bỏ "${courseName}" khỏi danh sách yêu thích?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedFavorites =
                await favoriteStorage.removeFavorite(courseId);
              setFavoriteIds(updatedFavorites);
              setFavoriteCourses((prev) =>
                prev.filter((course) => course._id !== courseId)
              );
              Alert.alert(
                "Thành công",
                "Đã bỏ khóa học khỏi danh sách yêu thích"
              );
            } catch (error) {
              console.log("Error removing favorite:", error);
              Alert.alert(
                "Lỗi",
                "Không thể xóa khóa học khỏi danh sách yêu thích"
              );
            }
          },
        },
      ]
    );
  };

  const handleCoursePress = (course) => {
    navigation.navigate("CourseDetail", { courseId: course._id });
  };

  const handleBrowseCourses = () => {
    navigation.getParent()?.navigate("Courses", {
      screen: "CourseList",
    });
  };

  const handleClearAllFavorites = () => {
    if (favoriteCourses.length === 0) return;

    Alert.alert(
      "Xóa tất cả",
      "Bạn có chắc muốn xóa tất cả khóa học khỏi danh sách yêu thích?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: async () => {
            try {
              await favoriteStorage.clearAllFavorites();
              setFavoriteIds([]);
              setFavoriteCourses([]);
              Alert.alert("Thành công", "Đã xóa tất cả khóa học yêu thích");
            } catch (error) {
              console.log("Error clearing favorites:", error);
              Alert.alert("Lỗi", "Không thể xóa danh sách yêu thích");
            }
          },
        },
      ]
    );
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    const totalRating = reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return (totalRating / reviews.length).toFixed(1);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Yêu thích</Text>
        <Text style={styles.subtitle}>
          {favoriteCourses.length > 0
            ? `${favoriteCourses.length} khóa học yêu thích`
            : "Chưa có khóa học yêu thích"}
        </Text>
      </View>

      {favoriteCourses.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearAllFavorites}
        >
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.image || item.imageUrl || item.thumbnail ? (
          <Image
            source={{ uri: item.image || item.imageUrl || item.thumbnail }}
            style={styles.courseImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="book" size={32} color="#3B82F6" />
          </View>
        )}

        <View style={styles.audienceBadge}>
          <Text style={styles.audienceText}>
            {courseService.getTargetAudienceText(item.targetAudience)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFromFavorites(item._id, item.name)}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.courseDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>
              {item.enrollmentCount || 0} học viên
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={styles.statText}>
              {calculateAverageRating(item.reviews)} (
              {item.reviews?.length || 0})
            </Text>
          </View>
        </View>

        {item.topics && item.topics.length > 0 && (
          <View style={styles.topicsContainer}>
            {item.topics.slice(0, 2).map((topic, index) => (
              <View key={index} style={styles.topicTag}>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
            {item.topics.length > 2 && (
              <Text style={styles.moreTopics}>+{item.topics.length - 2}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có khóa học yêu thích</Text>
      <Text style={styles.emptyText}>
        Hãy khám phá và thêm các khóa học bạn quan tâm vào danh sách yêu thích
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={handleBrowseCourses}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.browseButtonText}>Khám phá khóa học</Text>
      </TouchableOpacity>
    </View>
  );

  if (!loading && favoriteCourses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderHeader()}
        <View style={styles.emptyStateWrapper}>{renderEmptyState()}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {renderHeader()}
      {/* {renderStats()} */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải khóa học yêu thích...</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContainer,
            favoriteCourses.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={["#3B82F6"]}
            />
          }
          ListEmptyComponent={
            favoriteCourses.length === 0 ? renderEmptyState : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyListContainer: {
    flex: 1,
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  courseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  audienceBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  audienceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  courseDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  courseStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  topicTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topicText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  moreTopics: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateWrapper: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FavoriteCourseScreen;
