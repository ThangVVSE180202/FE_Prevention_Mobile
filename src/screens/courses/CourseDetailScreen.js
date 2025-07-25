import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { courseService } from "../../services/api";
import { favoriteStorage } from "../../utils";
import { useAuth } from "../../context/AuthContext";

const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [courseProgress, setCourseProgress] = useState(null);
  const [courseChapters, setCourseChapters] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [justDeletedReview, setJustDeletedReview] = useState(false);

  useEffect(() => {
    console.log("🔄 [STATE] userReview changed:", userReview);
    console.log("🔄 [STATE] justDeletedReview:", justDeletedReview);
  }, [userReview, justDeletedReview]);

  const isUserOwnedReview = (review) => {
    if (!user || !review) {
      console.log("[isUserOwnedReview] No user or review:", { user, review });
      return false;
    }

    const currentUserId = user.id || user._id;

    let reviewUserId;
    if (typeof review.user === "string") {
      reviewUserId = review.user;
    } else if (review.user && typeof review.user === "object") {
      reviewUserId = review.user._id || review.user.id;
    } else {
      reviewUserId = review.userId;
    }

    console.log("[isUserOwnedReview] Checking ownership:", {
      currentUserId,
      reviewUserId,
      reviewUserType: typeof review.user,
      reviewUserObject: review.user,
    });

    if (!currentUserId || !reviewUserId) {
      console.log("[isUserOwnedReview] Missing required IDs");
      return false;
    }

    const result = String(currentUserId) === String(reviewUserId);
    console.log("[isUserOwnedReview] ID comparison result:", result);

    return result;
  };

  useEffect(() => {
    fetchCourseDetail();
    fetchCourseReviews();
    checkEnrollmentStatus();
    loadCourseProgress();
    loadFavoriteStatus();
  }, [courseId]);

  useEffect(() => {
    if (!user) {
      setUserReview(null);
      setIsEnrolled(false);
      setCourseProgress(null);
      setIsCompleted(false);
      setIsFavorite(false);
      setJustDeletedReview(false);
      console.log(
        "[CourseDetail] User logged out, resetting user-related states"
      );
    } else {
      console.log(
        "[CourseDetail] User logged in, refreshing user-related data"
      );
      checkEnrollmentStatus();
      loadCourseProgress();
      loadFavoriteStatus();
      fetchCourseReviews();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("🔄 [FOCUS] Screen focused, refreshing data...");

      loadCourseProgress();

      fetchCourseReviews().then(() => {
        console.log(
          "🔄 [FOCUS] Reviews fetched, checking if need to fetch user review"
        );
        console.log("🔄 [FOCUS] Current userReview:", userReview);

        if (user && isEnrolled && !userReview && !justDeletedReview) {
          console.log(
            "🔄 [FOCUS] Fetching user review because userReview is null"
          );
          fetchUserReview();
        } else {
          console.log(
            "🔄 [FOCUS] Skip fetching user review - already have userReview or missing conditions or just deleted review"
          );
        }
      });

      fetchEnrollmentCount();
    });

    return unsubscribe;
  }, [navigation, user, isEnrolled, userReview, justDeletedReview]);

  const loadCourseProgress = async () => {
    if (!user || !isEnrolled) {
      setCourseProgress(null);
      setIsCompleted(false);
      return;
    }

    try {
      console.log(
        "[CourseDetail] Loading section progress for enrolled user..."
      );
      const progressResponse = await courseService.getSectionProgress(courseId);
      const sectionProgress = progressResponse.data;

      setCourseProgress(sectionProgress);
      setIsCompleted(sectionProgress.isCompleted || false);

      console.log("[CourseDetail] Loaded section progress:", sectionProgress);
    } catch (error) {
      console.log("[CourseDetail] Error loading course progress:", error);
      const totalSections =
        course?.sections?.length || courseChapters.length || 0;
      setCourseProgress({
        progress: 0,
        completedSections: [],
        currentSection: 0,
        totalSections: totalSections,
        isCompleted: false,
      });
      setIsCompleted(false);
    }
  };

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(courseId);
      console.log("[CourseDetail] Course data:", response);
      const courseData =
        response.data?.data || response.data?.course || response.data;
      setCourse(courseData);

      setEnrollmentCount(courseData?.enrollmentCount || 0);

      if (courseData?.sections && Array.isArray(courseData.sections)) {
        setCourseChapters(courseData.sections);
        console.log(
          "[CourseDetail] Loaded sections:",
          courseData.sections.length
        );
      } else {
        setCourseChapters([]);
        console.log("[CourseDetail] No sections found in course data");
      }
    } catch (error) {
      console.log("Error fetching course detail:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin khóa học");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReviews = async () => {
    try {
      console.log("[CourseDetail] Fetching reviews for course:", courseId);
      const response = await courseService.getCourseReviews(courseId);
      console.log("[CourseDetail] Reviews response:", response);

      let reviewsData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          reviewsData = response.data;
        } else if (
          response.data.reviews &&
          Array.isArray(response.data.reviews)
        ) {
          reviewsData = response.data.reviews;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          reviewsData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        reviewsData = response;
      }

      console.log("[CourseDetail] Extracted reviews:", reviewsData);
      console.log(
        "[CourseDetail] Reviews is array:",
        Array.isArray(reviewsData)
      );

      if (!Array.isArray(reviewsData)) {
        console.warn(
          "[CourseDetail] Reviews data is not an array, setting to empty array"
        );
        reviewsData = [];
      }

      setReviews(reviewsData);
    } catch (error) {
      console.log("Error fetching reviews:", error);
      setReviews([]);
    }
  };

  const fetchEnrollmentCount = async () => {
    try {
      const response = await courseService.getCourseEnrollments(courseId);
      setEnrollmentCount(response.data?.enrollments?.length || 0);
    } catch (error) {
      console.log("Error fetching enrollment count:", error);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!user) return;

    try {
      const enrolled = await courseService.checkEnrollmentStatus(courseId);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.log("Error checking enrollment:", error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      Alert.alert(
        "Đăng nhập cần thiết",
        "Bạn cần đăng nhập để đăng ký khóa học",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Auth") },
        ]
      );
      return;
    }

    try {
      setEnrolling(true);
      await courseService.enrollInCourse(courseId);
      setIsEnrolled(true);

      setEnrollmentCount((prev) => prev + 1);

      Alert.alert("Thành công", "Đã đăng ký khóa học thành công!");

      fetchCourseDetail();
    } catch (error) {
      console.log("Error enrolling:", error);
      Alert.alert("Lỗi", error.message || "Không thể đăng ký khóa học");
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    navigation.navigate("CourseContent", { courseId, courseName: course.name });
  };

  const handleWriteReview = () => {
    console.log("[handleWriteReview] Navigating to CourseReview screen");
    navigation.navigate("CourseReview", {
      courseId,
      courseName: course.name,
    });
  };

  const handleEditReview = (review) => {
    console.log("[CourseDetail] Editing review:", review);
    console.log("[CourseDetail] Current user:", user);
    console.log("[CourseDetail] Review user:", review.user);
    console.log("[CourseDetail] Review ID:", review._id || review.id);

    if (!isUserOwnedReview(review)) {
      Alert.alert("Lỗi", "Bạn chỉ có thể sửa đánh giá của chính mình");
      return;
    }

    const reviewId = review._id || review.id;
    if (!reviewId) {
      Alert.alert("Lỗi", "Không tìm thấy ID của đánh giá");
      return;
    }

    navigation.navigate("CourseReview", {
      courseId,
      courseName: course.name,
      editMode: true,
      existingReview: review,
      reviewId: reviewId,
    });
  };

  const handleDeleteReview = (review) => {
    if (!isUserOwnedReview(review)) {
      Alert.alert("Lỗi", "Bạn chỉ có thể xóa đánh giá của chính mình");
      return;
    }

    Alert.alert(
      "Xóa đánh giá",
      "Bạn có chắc chắn muốn xóa đánh giá này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => performDeleteReview(review),
        },
      ]
    );
  };

  const performDeleteReview = async (review) => {
    try {
      if (!isUserOwnedReview(review)) {
        Alert.alert("Lỗi", "Không có quyền xóa đánh giá này");
        return;
      }

      const reviewId = review._id || review.id;
      if (!reviewId) {
        Alert.alert("Lỗi", "Không tìm thấy ID của đánh giá");
        return;
      }

      console.log("[performDeleteReview] Deleting review:", reviewId);

      await courseService.deleteCourseReview(courseId, reviewId);

      console.log(
        "[performDeleteReview] Review deleted successfully, refreshing state"
      );

      console.log("🗑️ [DELETE] Setting justDeletedReview = true");
      setJustDeletedReview(true);

      console.log("🗑️ [DELETE] Setting userReview = null");
      setUserReview(null);

      await fetchCourseReviews();

      setTimeout(() => {
        console.log("🗑️ [DELETE] Resetting justDeletedReview = false");
        setJustDeletedReview(false);
      }, 1000);

      Alert.alert("Thành công", "Đã xóa đánh giá thành công!");
    } catch (error) {
      console.log("[performDeleteReview] Error deleting review:", error);
      Alert.alert("Lỗi", error.message || "Không thể xóa đánh giá");
    }
  };

  const fetchUserReview = async () => {
    if (!user || !isEnrolled) {
      console.log(
        "[fetchUserReview] No user or not enrolled, setting userReview to null"
      );
      setUserReview(null);
      return;
    }

    console.log(
      "[fetchUserReview] Starting fetch process for user:",
      user?.id || user?._id
    );

    if (reviews && reviews.length > 0) {
      console.log("[fetchUserReview] Checking reviews list first...");
      console.log(
        "[fetchUserReview] Reviews list:",
        reviews.map((r) => ({
          id: r._id,
          user: r.user,
          userType: typeof r.user,
          rating: r.rating,
          review: r.review?.substring(0, 50) + "...",
        }))
      );

      const existingUserReview = reviews.find((review) =>
        isUserOwnedReview(review)
      );

      if (existingUserReview) {
        console.log(
          "[fetchUserReview] ✅ Found user review in reviews list:",
          existingUserReview
        );
        console.log(
          "🔄 [SET_STATE] Setting userReview to:",
          existingUserReview
        );
        setUserReview(existingUserReview);
        return;
      } else {
        console.log("[fetchUserReview] No user review found in reviews list");
      }
    } else {
      console.log("[fetchUserReview] No reviews list or empty list");
    }

    try {
      console.log("[fetchUserReview] Fetching user review using API");
      const response = await courseService.getUserReview(courseId);
      console.log("[fetchUserReview] User review API response:", response);

      const userReviewData =
        response.data?.data || response.data?.review || response.data || null;

      if (userReviewData) {
        console.log(
          "[fetchUserReview] Found user review from API:",
          userReviewData
        );

        if (isUserOwnedReview(userReviewData)) {
          console.log(
            "[fetchUserReview] ✅ Valid user review from API, setting state"
          );
          setUserReview(userReviewData);
          return;
        } else {
          console.log(
            "[fetchUserReview] ❌ API review không thuộc về user hiện tại"
          );
        }
      } else {
        console.log("[fetchUserReview] No review data from API");
      }
    } catch (error) {
      console.log(
        "[fetchUserReview] API error (expected for 403):",
        error.message
      );
    }

    console.log("[fetchUserReview] ❌ No user review found, setting to null");
    console.log("🔄 [SET_STATE] Setting userReview to: null");
    setUserReview(null);
  };

  useEffect(() => {
    console.log(
      "[useEffect] Reviews loaded, checking if need to fetch user review:",
      {
        user: user?.id,
        isEnrolled,
        reviewsLength: reviews?.length,
        userReview: userReview?.id,
        justDeletedReview,
      }
    );

    if (
      reviews !== null &&
      reviews !== undefined &&
      user &&
      isEnrolled &&
      !userReview &&
      !justDeletedReview
    ) {
      console.log(
        "[useEffect] Fetching user review because userReview is null"
      );

      const existingUserReview = reviews.find((review) =>
        isUserOwnedReview(review)
      );
      if (existingUserReview) {
        console.log("[useEffect] Found user review in list, setting directly");
        setUserReview(existingUserReview);
      } else {
        console.log(
          "[useEffect] No user review in list, calling fetchUserReview"
        );
        fetchUserReview();
      }
    } else {
      console.log(
        "[useEffect] Skip fetching user review - already have userReview or missing conditions or just deleted review"
      );
    }
  }, [reviews, user, isEnrolled, userReview, justDeletedReview]);

  useEffect(() => {
    console.log("[useEffect] User or enrollment changed:", {
      user: user?.id,
      isEnrolled,
      justDeletedReview,
    });
    if (user && isEnrolled && !justDeletedReview) {
      fetchUserReview();
    } else {
      setUserReview(null);
    }
  }, [user, isEnrolled, justDeletedReview]);

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => {
      return sum + (review.rating || 0);
    }, 0);

    return (totalRating / reviews.length).toFixed(1);
  };

  const loadFavoriteStatus = async () => {
    try {
      const isFav = await favoriteStorage.isFavorite(courseId);
      setIsFavorite(isFav);
    } catch (error) {
      console.log("Error loading favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoriteStorage.removeFavorite(courseId);
        setIsFavorite(false);
        Alert.alert("Thành công", "Đã bỏ khóa học khỏi danh sách yêu thích");
      } else {
        await favoriteStorage.addFavorite(courseId);
        setIsFavorite(true);
        Alert.alert("Thành công", "Đã thêm khóa học vào danh sách yêu thích");
      }
    } catch (error) {
      console.log("Error toggling favorite:", error);
      Alert.alert("Lỗi", "Không thể cập nhật danh sách yêu thích");
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
      <Text style={styles.headerTitle}>Chi tiết khóa học</Text>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={toggleFavorite}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? "#FF6B6B" : "#FFFFFF"}
        />
      </TouchableOpacity>
    </View>
  );

  const renderCourseImage = () => (
    <View style={styles.imageContainer}>
      {course.image || course.coverImage || course.thumbnail ? (
        <Image
          source={{
            uri: course.image || course.coverImage || course.thumbnail,
          }}
          style={styles.courseImage}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="book" size={64} color="#3B82F6" />
          <Text style={styles.placeholderText}>Hình ảnh khóa học</Text>
        </View>
      )}

      <View style={styles.imageOverlay}>
        <View style={styles.audienceBadge}>
          <Text style={styles.audienceText}>
            {courseService.getTargetAudienceText(course.targetAudience)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCourseInfo = () => (
    <View style={styles.courseInfoContainer}>
      <Text style={styles.courseTitle}>{course.name}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={20} color="#3B82F6" />
          <Text style={styles.statText}>{enrollmentCount} học viên</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <Text style={styles.statText}>
            Cập nhật: {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <Text style={styles.statText}>
            {reviews.length > 0 ? calculateAverageRating() : "Chưa có"} (
            {reviews.length} đánh giá)
          </Text>
        </View>
      </View>

      <Text style={styles.courseDescription}>{course.description}</Text>
    </View>
  );

  const renderTopics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📚 Chủ đề khóa học</Text>
      <View style={styles.topicsContainer}>
        {course.topics?.map((topic, index) => (
          <View key={index} style={styles.topicTag}>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEnrollmentSection = () => {
    if (!user) {
      return (
        <View style={styles.enrollmentSection}>
          <View style={styles.loginPrompt}>
            <Ionicons name="person-outline" size={24} color="#6B7280" />
            <Text style={styles.loginText}>Đăng nhập để đăng ký khóa học</Text>
          </View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Auth")}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isEnrolled) {
      return (
        <View style={styles.enrollmentSection}>
          <View style={styles.enrolledBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.enrolledText}>Đã đăng ký khóa học</Text>
          </View>

          <TouchableOpacity
            style={styles.startLearningButton}
            onPress={handleStartLearning}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startLearningText}>Bắt đầu học</Text>
          </TouchableOpacity>

          {console.log("🔍 [RENDER] userReview state:", userReview)}
          {console.log("🔍 [RENDER] Show write review button:", !userReview)}
          {console.log("🔍 [RENDER] User enrolled:", isEnrolled)}
          {console.log("🔍 [RENDER] Current user:", user?.id || user?._id)}

          {!userReview && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={handleWriteReview}
            >
              <Ionicons name="star-outline" size={20} color="#3B82F6" />
              <Text style={styles.reviewButtonText}>Viết đánh giá</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.enrollmentSection}>
        <TouchableOpacity
          style={[
            styles.enrollButton,
            enrolling && styles.enrollButtonDisabled,
          ]}
          onPress={handleEnroll}
          disabled={enrolling}
        >
          {enrolling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.enrollButtonText}>
            {enrolling ? "Đang đăng ký..." : "Đăng ký khóa học"}
          </Text>
        </TouchableOpacity>

        <View style={styles.enrollmentInfo}>
          <Text style={styles.freeText}>Miễn phí</Text>
          <Text style={styles.enrollmentDescription}>
            Tham gia ngay để học các kiến thức bổ ích
          </Text>
        </View>
      </View>
    );
  };

  const renderReviews = () => {
    console.log("[renderReviews] All reviews:", reviews);
    console.log("[renderReviews] Current user:", user);
    console.log("[renderReviews] Current user ID:", user?.id || user?._id);

    if (reviews && reviews.length > 0) {
      console.log(
        "[renderReviews] Review user objects:",
        reviews.map((r) => ({
          reviewId: r._id,
          userId: r.user?._id,
          userName: r.user?.name,
        }))
      );

      const userReviewInList = reviews.find((review) =>
        isUserOwnedReview(review)
      );
      console.log("[renderReviews] User review in list:", userReviewInList);
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Đánh giá từ học viên</Text>

        {reviews.length === 0 ? (
          <View style={styles.noReviews}>
            <Ionicons name="chatbubble-outline" size={48} color="#E5E7EB" />
            <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
            <Text style={styles.noReviewsSubtext}>
              Hãy là người đầu tiên đánh giá khóa học này
            </Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {reviews.slice(0, 3).map((review, index) => {
              const isUserReview = isUserOwnedReview(review);
              console.log(
                `[renderReviews] Review ${index} - Is user review:`,
                isUserReview
              );

              return (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerInitial}>
                        {review.user?.name?.charAt(0) || "U"}
                      </Text>
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>
                        {review.user?.name || "Học viên"}
                        {isUserReview && (
                          <Text style={styles.youLabel}> (Bạn)</Text>
                        )}
                      </Text>
                      <View style={styles.ratingContainer}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? "star" : "star-outline"}
                            size={14}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>
                    {review.review || review.comment}
                  </Text>

                  {isUserReview && (
                    <View style={styles.reviewActions}>
                      <TouchableOpacity
                        style={styles.editReviewAction}
                        onPress={() => handleEditReview(review)}
                      >
                        <Text style={styles.editReviewActionText}>Sửa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteReviewAction}
                        onPress={() => handleDeleteReview(review)}
                      >
                        <Text style={styles.deleteReviewActionText}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            {reviews.length > 3 && (
              <TouchableOpacity style={styles.viewAllReviews}>
                <Text style={styles.viewAllReviewsText}>
                  Xem tất cả {reviews.length} đánh giá
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderProgressSection = () => {
    if (!courseProgress || courseChapters.length === 0 || !isEnrolled)
      return null;

    const completedSectionsCount =
      courseProgress.completedSections?.length || 0;
    const totalSections = courseChapters.length;
    const progressPercentage = courseProgress.progress || 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Tiến độ học tập</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {completedSectionsCount}/{totalSections} chương đã hoàn thành
            </Text>
            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progressPercentage}%` }]}
            />
          </View>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
              <Text style={styles.completedText}>Đã hoàn thành khóa học!</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderChaptersList = () => {
    if (courseChapters.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Nội dung khóa học</Text>

        <View style={styles.chaptersContainer}>
          {courseChapters.map((chapter, index) => {
            const isCompleted =
              courseProgress?.completedSections?.includes(index) || false;
            const isCurrent =
              isEnrolled && courseProgress?.currentSection === index;
            const isReadOrCompleted =
              isCompleted ||
              (isCompleted && index <= (courseProgress?.currentSection || 0));

            return (
              <View
                key={index}
                style={[
                  styles.chapterItem,
                  isCurrent && !isCompleted && styles.currentChapterItem,
                  isCompleted && styles.readChapterItem,
                ]}
              >
                <View
                  style={[
                    styles.chapterIcon,
                    isCompleted && styles.readChapterIconBg,
                    isCurrent && !isCompleted && styles.currentChapterIconBg,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.chapterNumber,
                        isCurrent && styles.currentChapterNumber,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>

                <View style={styles.chapterContent}>
                  <Text
                    style={[
                      styles.chapterTitle,
                      isCurrent && !isCompleted && styles.currentChapterTitle,
                      isCompleted && styles.readChapterTitle,
                    ]}
                    numberOfLines={2}
                  >
                    {chapter.title || `Chương ${index + 1}`}
                  </Text>

                  <View style={styles.chapterMeta}>
                    <Ionicons name="book-outline" size={14} color="#6B7280" />
                    <Text style={styles.chapterType}>Bài đọc</Text>
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
                    {isCurrent && !isCompleted && (
                      <>
                        <Ionicons
                          name="ellipse"
                          size={4}
                          color="#3B82F6"
                          style={{ marginHorizontal: 8 }}
                        />
                        <Text style={styles.currentStatus}>Đang học</Text>
                      </>
                    )}
                    {!isEnrolled && index === 0 && (
                      <>
                        <Ionicons
                          name="ellipse"
                          size={4}
                          color="#F59E0B"
                          style={{ marginHorizontal: 8 }}
                        />
                        <Text style={styles.startNowStatus}>Bắt đầu ngay</Text>
                      </>
                    )}
                  </View>
                </View>

                {isCurrent && !isCompleted && (
                  <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
                )}
                {!isEnrolled && index === 0 && (
                  <Ionicons name="play-circle" size={20} color="#F59E0B" />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải thông tin khóa học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Không tìm thấy khóa học</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderCourseImage()}
        {renderCourseInfo()}
        {renderTopics()}
        {renderEnrollmentSection()}
        {renderReviews()}
        {renderProgressSection()}
        {renderChaptersList()}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
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
    fontSize: 18,
    color: "#EF4444",
    marginTop: 16,
    textAlign: "center",
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  imageContainer: {
    position: "relative",
    height: 250,
    backgroundColor: "#F3F4F6",
  },
  courseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  placeholderText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  imageOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  audienceBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  audienceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  courseInfoContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  courseDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topicTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  topicText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  enrollmentSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  loginText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  enrolledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  enrolledText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
  },
  startLearningButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    width: "100%",
  },
  startLearningText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  reviewButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3B82F6",
    gap: 8,
    width: "100%",
  },
  reviewButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewActionsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  editReviewButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F59E0B",
    gap: 6,
  },
  editReviewButtonText: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteReviewButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#EF4444",
    gap: 6,
  },
  deleteReviewButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  freeText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
  },
  noReviews: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    fontWeight: "500",
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reviewerInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  viewAllReviews: {
    alignItems: "center",
    paddingVertical: 12,
  },
  viewAllReviewsText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  bottomPadding: {
    height: 32,
  },
  progressContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 8,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 4,
  },
  chaptersContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  currentChapterItem: {
    backgroundColor: "#EFF6FF",
  },
  chapterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  readChapterIconBg: {
    backgroundColor: "#10B981",
  },
  currentChapterIconBg: {
    backgroundColor: "#3B82F6",
  },
  chapterNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  currentChapterNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    marginBottom: 4,
  },
  currentChapterTitle: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  readChapterTitle: {
    color: "#10B981",
  },
  chapterMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chapterType: {
    fontSize: 14,
    color: "#6B7280",
  },
  readStatus: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  currentStatus: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  startNowStatus: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "500",
  },
  youLabel: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  reviewActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  editReviewAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  editReviewActionText: {
    fontSize: 13,
    color: "#65676B",
    marginLeft: 4,
    fontWeight: "500",
  },
  deleteReviewAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  deleteReviewActionText: {
    fontSize: 13,
    color: "#65676B",
    marginLeft: 4,
    fontWeight: "500",
  },
  enrollmentInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  enrollmentDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  enrollButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    width: "100%",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enrollButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  enrollButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CourseDetailScreen;
