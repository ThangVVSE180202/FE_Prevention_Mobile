import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { courseService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CourseReviewScreen = ({ route, navigation }) => {
  const {
    courseId,
    courseName,
    editMode = false,
    existingReview = null,
    reviewId = null,
  } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(
    existingReview?.review || existingReview?.comment || ""
  );
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  const isValidInput = useMemo(() => {
    return rating > 0 && comment.trim().length >= 10;
  }, [rating, comment]);

  const handleRatingPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleCommentSectionPress = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn số sao đánh giá");
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 10) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng viết ít nhất 10 ký tự trong đánh giá"
      );
      return;
    }

    try {
      setSubmitting(true);

      const reviewData = {
        rating,
        review: trimmedComment,
      };

      console.log(
        `[CourseReview] ${editMode ? "Updating" : "Submitting"} review:`,
        reviewData
      );

      let response;
      if (editMode && reviewId) {
        response = await courseService.updateCourseReview(
          courseId,
          reviewId,
          reviewData
        );
      } else {
        response = await courseService.addCourseReview(courseId, reviewData);
      }

      console.log("[CourseReview] Response:", response);

      Alert.alert(
        "Thành công",
        editMode
          ? "Đánh giá đã được cập nhật thành công!"
          : "Đánh giá của bạn đã được gửi thành công!",
        [
          {
            text: "OK",
            onPress: () => {
              if (!editMode) {
                setRating(0);
                setComment("");
              }

              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Lỗi",
        error.message || `Không thể ${editMode ? "cập nhật" : "gửi"} đánh giá`
      );
    } finally {
      setSubmitting(false);
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
      <Text style={styles.headerTitle}>
        {editMode ? "Sửa đánh giá" : "Viết đánh giá"}
      </Text>
    </View>
  );

  const renderRatingSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⭐ Đánh giá khóa học</Text>
      <Text style={styles.courseTitle} numberOfLines={2}>
        {courseName}
      </Text>

      <Text style={styles.ratingLabel}>
        Bạn đánh giá khóa học này bao nhiêu sao?
      </Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.starButton}
            onPress={() => handleRatingPress(star)}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={40}
              color={star <= rating ? "#F59E0B" : "#D1D5DB"}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.ratingText}>
        {rating === 0 && "Chưa chọn đánh giá"}
        {rating === 1 && "⭐ Rất tệ"}
        {rating === 2 && "⭐⭐ Tệ"}
        {rating === 3 && "⭐⭐⭐ Bình thường"}
        {rating === 4 && "⭐⭐⭐⭐ Tốt"}
        {rating === 5 && "⭐⭐⭐⭐⭐ Xuất sắc"}
      </Text>
    </View>
  );

  const renderCommentSection = () => (
    <TouchableOpacity
      style={styles.section}
      activeOpacity={1}
      onPress={handleCommentSectionPress}
    >
      <Text style={styles.sectionTitle}>💭 Nhận xét chi tiết</Text>

      <Text style={styles.commentLabel}>
        Chia sẻ trải nghiệm của bạn về khóa học này:
      </Text>

      <TextInput
        ref={commentInputRef}
        style={styles.commentInput}
        placeholder="Viết đánh giá chi tiết về khóa học... (tối thiểu 10 ký tự)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        placeholderTextColor="#9CA3AF"
        maxLength={500}
        autoFocus={false}
      />

      <Text style={styles.characterCount}>
        {comment.length}/500 ký tự
        {comment.trim().length >= 10 ? " ✓" : ""}
      </Text>
    </TouchableOpacity>
  );

  const renderSubmitSection = () => (
    <View style={styles.submitSection}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isValidInput || submitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmitReview}
        disabled={!isValidInput || submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons
            name={editMode ? "checkmark" : "send"}
            size={20}
            color="#FFFFFF"
          />
        )}
        <Text style={styles.submitButtonText}>
          {submitting
            ? editMode
              ? "Đang cập nhật..."
              : "Đang gửi..."
            : editMode
              ? "Cập nhật đánh giá"
              : "Gửi đánh giá"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.submitNote}>
        {editMode
          ? "Đánh giá được cập nhật sẽ hiển thị cho các học viên khác"
          : "Đánh giá của bạn sẽ giúp các học viên khác lựa chọn khóa học phù hợp"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderRatingSection()}
          {renderCommentSection()}
          {renderSubmitSection()}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  courseTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 20,
    lineHeight: 22,
  },
  ratingLabel: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F59E0B",
    textAlign: "center",
  },
  commentLabel: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 8,
  },
  submitSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
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
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  submitNote: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default CourseReviewScreen;
