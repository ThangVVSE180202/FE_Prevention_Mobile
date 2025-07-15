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

const SearchCourseScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicSearch, setIsTopicSearch] = useState(false);

  const filterOptions = [
    { value: "", label: "Tất cả" },
    { value: "student", label: "Học sinh" },
    { value: "university_student", label: "Sinh viên" },
    { value: "parent", label: "Phụ huynh" },
    { value: "teacher", label: "Giáo viên" },
  ];

  useEffect(() => {
    if (searchText.length >= 2) {
      fetchCourses(true);
    } else if (searchText.length === 0) {
      setCourses([]);
    }
  }, [selectedFilter]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.length >= 2) {
        if (isTopicSearch) {
          clearTopicSearch();
        }
        fetchCourses(true);
      } else if (searchText.length === 0) {
        setCourses([]);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    loadFavorites();
    fetchTopics();
  }, []);

  const normalizeSearchText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const fetchCourses = async (reset = false) => {
    if (searchText.length < 2) {
      setCourses([]);
      return;
    }

    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      setError(null);
      const currentPage = reset ? 1 : page;

      const normalizedSearch = normalizeSearchText(searchText);

      const params = {
        page: currentPage,
        limit: 10,
        search: normalizedSearch,
        ...(selectedFilter && { targetAudience: selectedFilter }),
      };

      console.log("[SearchCourseScreen] =========================");
      console.log(
        "[SearchCourseScreen] Original search text:",
        `"${searchText}"`
      );
      console.log(
        "[SearchCourseScreen] Normalized search text:",
        `"${normalizedSearch}"`
      );
      console.log("[SearchCourseScreen] Fetching courses with params:", params);

      const response = await courseService.getCourses(params);
      console.log("[SearchCourseScreen] Raw API response:", response);
      console.log("[SearchCourseScreen] Response structure:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : null,
        dataIsArray: Array.isArray(response.data),
        nestedData: response.data?.data
          ? {
              type: typeof response.data.data,
              isArray: Array.isArray(response.data.data),
              length: Array.isArray(response.data.data)
                ? response.data.data.length
                : "not array",
            }
          : "no nested data",
      });

      let allCourses = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        allCourses = response.data.data;
        console.log(
          "[SearchCourseScreen] Using response.data.data:",
          allCourses.length
        );
      } else if (response.data && Array.isArray(response.data)) {
        allCourses = response.data;
        console.log(
          "[SearchCourseScreen] Using response.data:",
          allCourses.length
        );
      } else if (response.courses && Array.isArray(response.courses)) {
        allCourses = response.courses;
        console.log(
          "[SearchCourseScreen] Using response.courses:",
          allCourses.length
        );
      } else {
        console.warn(
          "[SearchCourseScreen] No recognizable courses array found in response"
        );
        console.log(
          "[SearchCourseScreen] Full response:",
          JSON.stringify(response, null, 2)
        );
        allCourses = [];
      }

      console.log("[SearchCourseScreen] All courses found:", allCourses.length);

      if (allCourses.length > 0) {
        console.log("[SearchCourseScreen] First course sample:", {
          id: allCourses[0]._id || allCourses[0].id,
          name: allCourses[0].name || allCourses[0].title,
          description: allCourses[0].description,
          topics: allCourses[0].topics,
          keys: Object.keys(allCourses[0]),
        });

        allCourses.forEach((course, index) => {
          console.log(`[SearchCourseScreen] Course ${index + 1}:`, {
            name: course.name,
            description: course.description,
            topics: course.topics,
          });
        });
      }

      const coursesToShow = allCourses;

      console.log(
        "[SearchCourseScreen] Courses to show:",
        coursesToShow.length
      );
      console.log("[SearchCourseScreen] =========================");

      if (reset) {
        setCourses(coursesToShow);
      } else {
        setCourses((prev) => [...prev, ...coursesToShow]);
      }

      setHasMore(coursesToShow.length === 10);
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (err) {
      setError(err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách khóa học: " + err.message);
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
      console.log("Error loading favorites:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      console.log("[SearchScreen] Fetching topics...");
      const response = await courseService.getTopics();

      console.log("[SearchScreen] Raw topics response:", response);

      let topicsData = [];
      if (
        response.data &&
        response.data.topics &&
        Array.isArray(response.data.topics)
      ) {
        topicsData = response.data.topics;
        console.log("[SearchScreen] Using response.data.topics:", topicsData);
      } else if (response.data && Array.isArray(response.data)) {
        topicsData = response.data;
        console.log("[SearchScreen] Using response.data:", topicsData);
      } else if (response.topics && Array.isArray(response.topics)) {
        topicsData = response.topics;
        console.log("[SearchScreen] Using response.topics:", topicsData);
      } else if (Array.isArray(response)) {
        topicsData = response;
        console.log("[SearchScreen] Using response directly:", topicsData);
      }

      console.log("[SearchScreen] Final topics data:", topicsData);
      console.log("[SearchScreen] Topics count:", topicsData.length);
      setTopics(topicsData);
    } catch (error) {
      console.log("[SearchScreen] Error fetching topics:", error);
    } finally {
      setTopicsLoading(false);
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
      console.log("Error toggling favorite:", error);
      Alert.alert("Lỗi", "Không thể cập nhật danh sách yêu thích");
    }
  };

  const onRefresh = () => {
    if (isTopicSearch && selectedTopic) {
      setRefreshing(true);
      searchByTopic(selectedTopic, true);
    } else if (searchText.length >= 2) {
      setRefreshing(true);
      fetchCourses(true);
    }
  };

  const searchByTopic = async (topic, reset = false) => {
    if (!topic) {
      setCourses([]);
      return;
    }

    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedFilter && { targetAudience: selectedFilter }),
      };

      console.log("[SearchScreen] Searching courses by topic:", topic);
      const response = await courseService.searchCoursesByTopics(
        [topic],
        params
      );

      let coursesData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        coursesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response.courses && Array.isArray(response.courses)) {
        coursesData = response.courses;
      }

      console.log(
        "[SearchScreen] Courses found for topic:",
        coursesData.length
      );

      if (reset) {
        setCourses(coursesData);
      } else {
        setCourses((prev) => [...prev, ...coursesData]);
      }

      setHasMore(coursesData.length === 10);
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.log("[SearchScreen] Error searching courses by topic:", error);
      Alert.alert("Lỗi", "Không thể tìm kiếm khóa học theo chủ đề");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTopicPress = (topic) => {
    const topicName = typeof topic === "string" ? topic : topic.name || topic;
    console.log("[SearchScreen] Topic pressed:", topicName);

    if (selectedTopic === topicName) {
      console.log("[SearchScreen] Toggling off topic:", topicName);
      clearTopicSearch();
      return;
    }

    setSearchText("");
    setSelectedTopic(topicName);
    setIsTopicSearch(true);

    searchByTopic(topicName, true);
  };

  const clearTopicSearch = () => {
    setSelectedTopic(null);
    setIsTopicSearch(false);
    setCourses([]);
  };

  const loadMoreCourses = () => {
    if (!loading && hasMore) {
      if (isTopicSearch && selectedTopic) {
        searchByTopic(selectedTopic, false);
      } else if (searchText.length >= 2) {
        fetchCourses(false);
      }
    }
  };

  const handleCoursePress = (course) => {
    navigation.navigate("CourseDetail", { courseId: course._id });
  };

  const clearSearch = () => {
    setSearchText("");
    setCourses([]);
    if (isTopicSearch) {
      clearTopicSearch();
    }
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

  const renderTopics = () => {
    return (
      <View style={styles.topicsContainer}>
        <Text style={styles.topicsTitle}>🏷️ Chủ đề phổ biến</Text>

        {topicsLoading ? (
          <View style={styles.topicsLoadingContainer}>
            <Text style={styles.topicsLoadingText}>Đang tải chủ đề...</Text>
          </View>
        ) : topics.length === 0 ? (
          <View style={styles.topicsEmptyContainer}>
            <Text style={styles.topicsEmptyText}>Không có chủ đề nào</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.topicsScrollView}
            contentContainerStyle={styles.topicsContent}
          >
            {topics.slice(0, 10).map((topic, index) => {
              const topicName =
                typeof topic === "string" ? topic : topic.name || topic;
              const isSelected = selectedTopic === topicName;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.topicTag,
                    isSelected && styles.selectedTopicTag,
                  ]}
                  onPress={() => handleTopicPress(topic)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.topicTagText,
                      isSelected && styles.selectedTopicTagText,
                    ]}
                  >
                    {topicName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (searchText.length === 0 && !isTopicSearch) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Tìm kiếm khóa học</Text>
          <Text style={styles.emptyText}>
            Nhập từ khóa để tìm kiếm các khóa học phòng ngừa hoặc chọn chủ đề
            bên dưới
          </Text>
        </View>
      );
    }

    if (searchText.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="create-outline" size={80} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Từ khóa quá ngắn</Text>
          <Text style={styles.emptyText}>
            Vui lòng nhập ít nhất 2 ký tự để tìm kiếm
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={80} color="#E5E7EB" />
        <Text style={styles.emptyTitle}>Không tìm thấy khóa học</Text>
        <Text style={styles.emptyText}>Thử tìm kiếm với từ khóa khác</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Tìm kiếm</Text>
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
            autoFocus={false}
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

      {renderTopics()}

      <FlatList
        data={courses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContainer,
          courses.length === 0 && styles.emptyListContainer,
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
        onEndReached={loadMoreCourses}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
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
  emptyListContainer: {
    flexGrow: 1,
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
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
  topicsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  topicsScrollView: {
    paddingHorizontal: 20,
  },
  topicsContent: {
    paddingRight: 20,
  },
  topicTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedTopicTag: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  topicTagText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  selectedTopicTagText: {
    color: "#FFFFFF",
  },
  topicsLoadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  topicsLoadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  topicsEmptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  topicsEmptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});

export default SearchCourseScreen;
