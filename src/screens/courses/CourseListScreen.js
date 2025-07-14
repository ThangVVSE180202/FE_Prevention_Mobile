// 📚 Course List Screen
// Display list of all available courses with search and filter functionality

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
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { courseService } from "../../services/api";
import { favoriteStorage } from "../../utils";

const CourseListScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Filter options
  const filterOptions = [
    { value: "", label: "Tất cả" },
    { value: "student", label: "Học sinh" },
    { value: "university_student", label: "Sinh viên" },
    { value: "parent", label: "Phụ huynh" },
    { value: "teacher", label: "Giáo viên" },
  ];

  useEffect(() => {
    fetchCourses(true);
  }, [selectedFilter]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchCourses(true);
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.length >= 2 || searchText.length === 0) {
        fetchCourses(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const fetchCourses = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      setError(null);
      const currentPage = reset ? 1 : page;

      const params = {
        page: currentPage,
        limit: 10,
        isPublished: true,
        ...(searchText && { search: searchText }),
        ...(selectedFilter && { targetAudience: selectedFilter }),
      };

      console.log("[CourseListScreen] Fetching courses with params:", params);
      const response = await courseService.getCourses(params);
      console.log("[CourseListScreen] API Response:", response);

      const allCourses = response.data?.data || [];
      const publishedCourses = allCourses.filter(
        (course) => course.isPublished === true
      );
      console.log("[CourseListScreen] Published courses:", publishedCourses);

      if (reset) {
        setCourses(publishedCourses);
      } else {
        setCourses((prev) => [...prev, ...publishedCourses]);
      }

      setHasMore(publishedCourses.length === 10);
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoriteCourses = await favoriteStorage.getFavorites();
      setFavorites(favoriteCourses);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (courseId) => {
    try {
      const isFav = favorites.includes(courseId);

      if (isFav) {
        const updatedFavorites = await favoriteStorage.removeFavorite(courseId);
        setFavorites(updatedFavorites);
        Alert.alert("Thành công", "Đã bỏ khóa học khỏi danh sách yêu thích");
      } else {
        const updatedFavorites = await favoriteStorage.addFavorite(courseId);
        setFavorites(updatedFavorites);
        Alert.alert("Thành công", "Đã thêm khóa học vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Lỗi", "Không thể cập nhật danh sách yêu thích");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses(true);
  };

  const loadMoreCourses = () => {
    if (!loading && hasMore) {
      fetchCourses(false);
    }
  };

  const handleCoursePress = (course) => {
    navigation.navigate("CourseDetail", { courseId: course._id });
  };

  const clearSearch = () => {
    setSearchText("");
  };

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setShowFilterModal(false);
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

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.image || item.imageUrl ? (
          <Image
            source={{ uri: item.image || item.imageUrl }}
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
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item._id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={favorites.includes(item._id) ? "heart" : "heart-outline"}
            size={24}
            color={favorites.includes(item._id) ? "#FF6B6B" : "#1F2937"}
          />
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

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lọc theo đối tượng</Text>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterOptions}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedFilter === option.value && styles.selectedFilter,
                ]}
                onPress={() => applyFilter(option.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === option.value &&
                      styles.selectedFilterText,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedFilter === option.value && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={48} color="#E5E7EB" />
          <Text style={styles.loadingText}>Đang tải khóa học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Khóa học</Text>
          <Text style={styles.subtitle}>Khám phá các khóa học phòng ngừa</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khóa học..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter && styles.activeFilterButton,
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={selectedFilter ? "#FFFFFF" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      {selectedFilter && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>
            Đối tượng: {courseService.getTargetAudienceText(selectedFilter)}
          </Text>
          <TouchableOpacity onPress={() => applyFilter("")}>
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={courses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
        onEndReached={loadMoreCourses}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>Không tìm thấy khóa học</Text>
              <Text style={styles.emptyText}>
                {searchText
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Hiện tại chưa có khóa học nào"}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && courses.length > 0 ? (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
      />

      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    alignItems: "center",
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
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#3B82F6",
  },
  activeFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  activeFilterText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
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
  favoriteIcon: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadingMoreText: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  filterOptions: {
    padding: 20,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFilter: {
    backgroundColor: "#EFF6FF",
  },
  filterText: {
    fontSize: 16,
    color: "#4B5563",
  },
  selectedFilterText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
});

export default CourseListScreen;
