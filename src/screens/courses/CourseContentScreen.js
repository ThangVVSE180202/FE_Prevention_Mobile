import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { courseService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CourseContentScreen = ({ route, navigation }) => {
  const { courseId, courseName } = route.params;
  const { user } = useAuth();
  const [courseContent, setCourseContent] = useState(null);
  const [courseSections, setCourseSections] = useState([]);
  const [sectionProgress, setSectionProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [error, setError] = useState(null);
  const [showChapterMenu, setShowChapterMenu] = useState(false);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[CourseContent] Fetching course data for:", courseId);

      const courseResponse = await courseService.getCourseById(courseId);
      console.log("[CourseContent] Course response:", courseResponse);

      const courseData =
        courseResponse.data?.data ||
        courseResponse.data?.course ||
        courseResponse.data;

      setCourseContent(courseData);

      if (
        courseData?.sections &&
        Array.isArray(courseData.sections) &&
        courseData.sections.length > 0
      ) {
        setCourseSections(courseData.sections);
        console.log(
          "[CourseContent] Using new sections format:",
          courseData.sections.length
        );
      } else if (
        courseData?.content &&
        typeof courseData.content === "string"
      ) {
        console.log(
          "[CourseContent] Converting old content format to sections"
        );
        const parsedSections = courseService.parseCourseContent(
          courseData.content
        );
        setCourseSections(parsedSections);
        console.log("[CourseContent] Parsed sections:", parsedSections.length);
      } else {
        console.warn("[CourseContent] No content or sections found");
        setCourseSections([]);
      }

      if (
        courseSections.length > 0 ||
        (courseData?.sections && courseData.sections.length > 0)
      ) {
        try {
          const progressResponse =
            await courseService.getSectionProgress(courseId);
          const progressData = progressResponse.data;

          setSectionProgress(progressData);
          setCurrentChapter(progressData.currentSection || 0);

          console.log("[CourseContent] Section progress:", progressData);
        } catch (progressError) {
          console.log(
            "[CourseContent] No progress found, starting fresh:",
            progressError
          );
          const totalSections =
            courseData?.sections?.length ||
            (courseData?.content
              ? courseService.parseCourseContent(courseData.content).length
              : 0);
          setSectionProgress({
            progress: 0,
            completedSections: [],
            currentSection: 0,
            totalSections: totalSections,
            isCompleted: false,
          });
          setCurrentChapter(0);
        }
      } else {
        setSectionProgress({
          progress: 0,
          completedSections: [],
          currentSection: 0,
          totalSections: 0,
          isCompleted: false,
        });
      }
    } catch (error) {
      console.log("Error fetching course content:", error);
      setError(error.message);
      Alert.alert("Lỗi", error.message || "Không thể tải nội dung khóa học");
    } finally {
      setLoading(false);
    }
  };

  const markSectionAsCompleted = async (sectionIndex) => {
    try {
      console.log(
        `[CourseContent] Marking section ${sectionIndex} as completed`
      );

      const response = await courseService.completeSection(
        courseId,
        sectionIndex
      );
      console.log("[CourseContent] Section completion response:", response);

      const updatedProgress = response.data.enrollment;
      setSectionProgress(updatedProgress);

      Alert.alert(
        "Thành công",
        response.message || `Hoàn thành chương ${sectionIndex + 1}`
      );

      if (updatedProgress.isCompleted) {
        setTimeout(() => {
          Alert.alert(
            "🎉 Chúc mừng!",
            "Bạn đã hoàn thành khóa học! Cảm ơn bạn đã học tập cùng chúng tôi.",
            [
              { text: "Tiếp tục đọc", style: "cancel" },
              {
                text: "Viết đánh giá",
                onPress: () =>
                  navigation.navigate("CourseReview", { courseId, courseName }),
              },
            ]
          );
        }, 1000);
      }
    } catch (error) {
      console.log("Error completing section:", error);
      Alert.alert("Lỗi", "Không thể hoàn thành chương. Vui lòng thử lại.");
    }
  };

  const handleSectionPress = async (index) => {
    setCurrentChapter(index);
    setShowChapterMenu(false);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleNextSection = () => {
    if (currentChapter < courseSections.length - 1) {
      const nextSection = currentChapter + 1;
      setCurrentChapter(nextSection);
    }
  };

  const handlePreviousSection = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseName || "Nội dung khóa học"}
        </Text>
        <Text style={styles.headerSubtitle}>
          Chương {currentChapter + 1}/{courseSections.length || 0}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowChapterMenu(true)}
      >
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderProgressBar = () => {
    const completedCount = sectionProgress?.completedSections?.length || 0;
    const totalSections = courseSections.length || 0;
    const progressPercent = sectionProgress?.progress || 0;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Tiến độ học tập</Text>
          <Text style={styles.progressStatus}>
            {completedCount}/{totalSections} chương - {progressPercent}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderChapterNavigation = () => {
    return null;
  };

  const renderChapterContent = () => {
    if (!courseSections || courseSections.length === 0) {
      return (
        <View style={styles.noContentContainer}>
          <Ionicons name="document-text-outline" size={64} color="#E5E7EB" />
          <Text style={styles.noContentText}>
            Nội dung chương đang được cập nhật
          </Text>
        </View>
      );
    }

    const currentSection = courseSections[currentChapter];
    const isCompleted =
      sectionProgress?.completedSections?.includes(currentChapter) || false;

    return (
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.chapterContentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          ref={scrollViewRef}
        >
          <View style={styles.chapterContent}>
            <Text style={styles.compactChapterTitle}>
              {currentSection.title || `Chương ${currentChapter + 1}`}
            </Text>

            <Text style={styles.textContent}>
              {currentSection.content ||
                "Nội dung chương đang được cập nhật..."}
            </Text>

            <View style={styles.chapterFooter}>
              {isCompleted ? (
                <TouchableOpacity
                  style={styles.completedChapterButton}
                  disabled={true}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.completedChapterText}>Đã hoàn thành</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.completeChapterButton}
                  onPress={() => markSectionAsCompleted(currentChapter)}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.completeChapterText}>Hoàn thành</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderChapterMenu = () => (
    <Modal
      visible={showChapterMenu}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowChapterMenu(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Danh sách chương</Text>
            <TouchableOpacity
              onPress={() => setShowChapterMenu(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.chapterMenuList}
            showsVerticalScrollIndicator={false}
          >
            {courseSections.map((section, index) => {
              const isCompleted =
                sectionProgress?.completedSections?.includes(index) || false;
              const isCurrent = index === currentChapter;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chapterMenuItem,
                    isCurrent && styles.activeChapterMenuItem,
                    isCompleted && styles.readChapterMenuItem,
                  ]}
                  onPress={() => handleSectionPress(index)}
                >
                  <View
                    style={[
                      styles.chapterMenuIcon,
                      isCompleted && styles.readChapterMenuIcon,
                      isCurrent && styles.currentChapterMenuIcon,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.chapterMenuNumber,
                          isCurrent && styles.currentChapterMenuNumber,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  <View style={styles.chapterMenuContent}>
                    <Text
                      style={[
                        styles.chapterMenuTitle,
                        isCurrent && styles.activeChapterMenuTitle,
                        isCompleted && styles.readChapterMenuTitle,
                      ]}
                      numberOfLines={2}
                    >
                      {section.title || `Chương ${index + 1}`}
                    </Text>
                    <View style={styles.chapterMenuMeta}>
                      <Ionicons
                        name="book-outline"
                        size={14}
                        color={isCurrent ? "#3B82F6" : "#6B7280"}
                      />
                      <Text
                        style={[
                          styles.chapterMenuType,
                          isCurrent && styles.activeChapterMenuType,
                        ]}
                      >
                        Bài đọc
                      </Text>
                      {isCompleted && (
                        <>
                          <Ionicons
                            name="ellipse"
                            size={4}
                            color="#10B981"
                            style={{ marginHorizontal: 8 }}
                          />
                          <Text style={styles.readStatus}>Đã hoàn thành</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {isCurrent && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#3B82F6"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải nội dung khóa học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !courseContent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>
            {error || "Không thể tải nội dung khóa học"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCourseContent}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {renderHeader()}
      {renderProgressBar()}

      <View style={styles.content}>{renderChapterContent()}</View>

      {renderChapterMenu()}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginTop: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#DBEAFE",
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  progressContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressStatus: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  chapterNavigation: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  chapterList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chapterTab: {
    alignItems: "center",
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeChapterTab: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
  },
  readChapterTab: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
  },
  chapterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  readChapterIcon: {
    backgroundColor: "#10B981",
  },
  currentChapterIcon: {
    backgroundColor: "#3B82F6",
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  currentChapterNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  chapterTabText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  readChapterTabText: {
    color: "#10B981",
    fontWeight: "500",
  },
  activeChapterTabText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  chapterHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 28,
  },
  chapterMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  chapterType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chapterTypeText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  chapterContentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  chapterContent: {
    padding: 20,
  },
  compactChapterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    lineHeight: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  textContent: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 26,
  },
  videoPlaceholder: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  videoText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    fontWeight: "500",
  },
  videoSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noContentText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  prevButton: {
    backgroundColor: "#F3F4F6",
  },
  nextButton: {
    backgroundColor: "#3B82F6",
  },
  completeButton: {
    backgroundColor: "#10B981",
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#F9FAFB",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  completedButton: {
    backgroundColor: "#4ADE80",
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  completedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#3B82F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  chapterMenuList: {
    maxHeight: 400,
    paddingVertical: 8,
  },
  chapterMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
  },
  activeChapterMenuItem: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  readChapterMenuItem: {
    backgroundColor: "#F0FDF4",
  },
  chapterMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  readChapterMenuIcon: {
    backgroundColor: "#10B981",
  },
  currentChapterMenuIcon: {
    backgroundColor: "#3B82F6",
  },
  chapterMenuNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  currentChapterMenuNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  chapterMenuContent: {
    flex: 1,
  },
  chapterMenuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 22,
  },
  activeChapterMenuTitle: {
    color: "#3B82F6",
  },
  readChapterMenuTitle: {
    color: "#059669",
  },
  chapterMenuMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  chapterMenuType: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  activeChapterMenuType: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  readStatus: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionNumberCompleted: {
    backgroundColor: "#10B981",
  },
  sectionNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  completedBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  sectionContent: {
    padding: 16,
  },
  sectionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  sectionFooter: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  completeButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  completedButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.6,
  },
  completeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 4,
  },
  completedText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  bottomPadding: {
    height: 16,
  },
  chapterFooter: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  completeChapterButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  completedChapterButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.6,
  },
  completeChapterText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 4,
  },
  completedChapterText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 4,
  },
});

export default CourseContentScreen;
