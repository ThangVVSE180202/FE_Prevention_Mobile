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
import { useAuth } from "../../context/AuthContext";

const MyCourseScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyCourses();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user && enrolledCourses.length > 0) {
        loadAllCourseProgress(enrolledCourses);
      }
    });

    return unsubscribe;
  }, [navigation, user, enrolledCourses]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[MyCourses] Fetching enrolled courses...");
      const response = await courseService.getMyEnrolledCourses();
      console.log("[MyCourses] Response:", response);

      const courses =
        response.data?.enrollments ||
        response.data?.courses ||
        response.data ||
        [];
      setEnrolledCourses(courses);

      await loadAllCourseProgress(courses);
    } catch (err) {
      console.log("Error fetching my courses:", err);
      setError(err.message);
      if (err.message.includes("401") || err.message.includes("unauthorized")) {
        Alert.alert(
          "Lỗi",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else {
        Alert.alert("Lỗi", "Không thể tải danh sách khóa học của bạn");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAllCourseProgress = async (courses) => {
    try {
      const progressData = {};

      for (const courseItem of courses) {
        const course = courseItem.course || courseItem;
        const courseId = course._id;

        try {
          const progressResponse =
            await courseService.getSectionProgress(courseId);
          const sectionProgress = progressResponse.data;

          progressData[courseId] = {
            progress: sectionProgress.progress || 0,
            isCompleted: sectionProgress.isCompleted || false,
            completedSections: sectionProgress.completedSections || [],
            currentSection: sectionProgress.currentSection || 0,
            totalSections: sectionProgress.totalSections || 0,
            sectionsProgress: sectionProgress.sectionsProgress || [],
          };
        } catch (error) {
          console.log(
            `[MyCourses] No progress found for course ${courseId}:`,
            error
          );
          progressData[courseId] = {
            progress: 0,
            isCompleted: false,
            completedSections: [],
            currentSection: 0,
            totalSections: course.sections?.length || 0,
            sectionsProgress: [],
          };
        }
      }

      setCourseProgress(progressData);
      console.log("[MyCourses] Loaded progress for all courses:", progressData);
    } catch (error) {
      console.log("Error loading course progress:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    refreshCoursesData();
  };

  const refreshCoursesData = async () => {
    try {
      setError(null);
      console.log("[MyCourses] Refreshing enrolled courses...");
      const response = await courseService.getMyEnrolledCourses();
      console.log("[MyCourses] Refresh Response:", response);

      const courses =
        response.data?.enrollments ||
        response.data?.courses ||
        response.data ||
        [];
      setEnrolledCourses(courses);

      await loadAllCourseProgress(courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCoursePress = (course) => {
    navigation.navigate("CourseContent", {
      courseId: course._id || course.course?._id,
      courseName: course.name || course.course?.name,
    });
  };

  const handleBrowseCourses = () => {
    navigation.getParent()?.navigate("Search", {
      screen: "SearchList",
    });
  };

  const getCourseProgress = (courseItem) => {
    const course = courseItem.course || courseItem;
    const courseId = course._id;

    const progressData = courseProgress[courseId];
    if (!progressData) {
      return { progress: 0, isCompleted: false };
    }

    return {
      progress: progressData.progress || 0,
      isCompleted: progressData.isCompleted || false,
      totalSections: progressData.totalSections || 0,
      completedSections: progressData.completedSections?.length || 0,
    };
  };

  const renderCourseCard = ({ item }) => {
    const course = item.course || item;
    const { progress, isCompleted } = getCourseProgress(item);

    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => handleCoursePress(course)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {course.image || course.imageUrl ? (
            <Image
              source={{ uri: course.image || course.imageUrl }}
              style={styles.courseImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="book" size={32} color="#3B82F6" />
            </View>
          )}

          <View
            style={[styles.progressBadge, isCompleted && styles.completedBadge]}
          >
            <Text style={styles.progressText}>
              {isCompleted ? "Hoàn thành" : `${progress}%`}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {course.name}
          </Text>

          <Text style={styles.courseDescription} numberOfLines={2}>
            {course.description}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%` },
                  isCompleted && styles.completedFill,
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {isCompleted ? "Đã hoàn thành" : `${progress}% hoàn thành`}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.courseStats}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>
                {courseService.getTargetAudienceText(course.targetAudience)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>
                Đăng ký:{" "}
                {new Date(item.enrolledAt || item.createdAt).toLocaleDateString(
                  "vi-VN"
                )}
              </Text>
            </View>
          </View>

          {course.topics && course.topics.length > 0 && (
            <View style={styles.topicsContainer}>
              {course.topics.slice(0, 2).map((topic, index) => (
                <View key={index} style={styles.topicTag}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
              {course.topics.length > 2 && (
                <Text style={styles.moreTopics}>
                  +{course.topics.length - 2}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="book-outline" size={80} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có khóa học nào</Text>
      <Text style={styles.emptyText}>
        Bạn chưa đăng ký khóa học nào. Hãy khám phá và đăng ký các khóa học
        phòng ngừa ma túy hữu ích.
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

  const renderLoginPrompt = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="person-outline" size={80} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>Đăng nhập để xem khóa học</Text>
      <Text style={styles.emptyText}>
        Bạn cần đăng nhập để xem danh sách khóa học đã đăng ký.
      </Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Auth")}
      >
        <Ionicons name="log-in" size={20} color="#FFFFFF" />
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Khóa học của tôi</Text>
            <Text style={styles.subtitle}>Quản lý quá trình học tập</Text>
          </View>
        </View>

        {renderLoginPrompt()}
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Khóa học của tôi</Text>
            <Text style={styles.subtitle}>Quản lý quá trình học tập</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải khóa học của bạn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Khóa học của tôi</Text>
          <Text style={styles.subtitle}>
            {enrolledCourses.length > 0
              ? `${enrolledCourses.length} khóa học đã đăng ký`
              : "Quản lý quá trình học tập"}
          </Text>
        </View>

        {enrolledCourses.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleBrowseCourses}
          >
            <Ionicons name="add" size={24} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>

      {enrolledCourses.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {
                enrolledCourses.filter(
                  (course) => getCourseProgress(course).progress >= 100
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {
                enrolledCourses.filter((course) => {
                  const { progress } = getCourseProgress(course);
                  return progress > 0 && progress < 100;
                }).length
              }
            </Text>
            <Text style={styles.statLabel}>Đang học</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{enrolledCourses.length}</Text>
            <Text style={styles.statLabel}>Tổng khóa học</Text>
          </View>
        </View>
      )}

      <FlatList
        data={enrolledCourses}
        renderItem={renderCourseCard}
        keyExtractor={(item, index) =>
          (item._id || item.course?._id || index).toString()
        }
        contentContainerStyle={[
          styles.listContainer,
          enrolledCourses.length === 0 && styles.emptyListContainer,
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
        ListEmptyComponent={renderEmptyState}
      />
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
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
    height: 140,
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
  progressBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
  },
  progressText: {
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
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  completedFill: {
    backgroundColor: "#10B981",
  },
  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
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
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "500",
  },
  moreTopics: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
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
  loginButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MyCourseScreen;
