import AsyncStorage from "@react-native-async-storage/async-storage";

class ProgressService {
  static PROGRESS_KEY = "course_progress";
  static READ_CHAPTERS_KEY = "read_chapters";
  static COMPLETED_COURSES_KEY = "completed_courses";

  async saveProgress(courseId, chapterIndex, readChapters = new Set()) {
    try {
      const progressData = {
        courseId,
        currentChapter: chapterIndex,
        readChapters: Array.from(readChapters),
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        `${ProgressService.PROGRESS_KEY}_${courseId}`,
        JSON.stringify(progressData)
      );

      console.log(
        `[ProgressService] Saved progress for course ${courseId}:`,
        progressData
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }

  async loadProgress(courseId) {
    try {
      const progressData = await AsyncStorage.getItem(
        `${ProgressService.PROGRESS_KEY}_${courseId}`
      );

      if (progressData) {
        const parsed = JSON.parse(progressData);
        return {
          currentChapter: parsed.currentChapter || 0,
          readChapters: new Set(parsed.readChapters || []),
          lastUpdated: parsed.lastUpdated,
        };
      }

      return {
        currentChapter: 0,
        readChapters: new Set(),
        lastUpdated: null,
      };
    } catch (error) {
      console.error("Error loading progress:", error);
      return {
        currentChapter: 0,
        readChapters: new Set(),
        lastUpdated: null,
      };
    }
  }

  async markCourseCompleted(courseId, courseName) {
    try {
      let completedCourses = await this.getCompletedCourses();

      const courseCompletion = {
        courseId,
        courseName,
        completedAt: new Date().toISOString(),
      };

      completedCourses = completedCourses.filter(
        (c) => c.courseId !== courseId
      );
      completedCourses.push(courseCompletion);

      await AsyncStorage.setItem(
        ProgressService.COMPLETED_COURSES_KEY,
        JSON.stringify(completedCourses)
      );

      console.log(`[ProgressService] Marked course ${courseId} as completed`);
    } catch (error) {
      console.error("Error marking course as completed:", error);
    }
  }

  async getCompletedCourses() {
    try {
      const completedData = await AsyncStorage.getItem(
        ProgressService.COMPLETED_COURSES_KEY
      );
      return completedData ? JSON.parse(completedData) : [];
    } catch (error) {
      console.error("Error getting completed courses:", error);
      return [];
    }
  }

  async isCourseCompleted(courseId) {
    try {
      const completedCourses = await this.getCompletedCourses();
      return completedCourses.some((c) => c.courseId === courseId);
    } catch (error) {
      console.error("Error checking course completion:", error);
      return false;
    }
  }

  async getCourseCompletionPercentage(courseId, totalChapters) {
    try {
      const progress = await this.loadProgress(courseId);
      const readCount = progress.readChapters.size;
      return totalChapters > 0
        ? Math.round((readCount / totalChapters) * 100)
        : 0;
    } catch (error) {
      console.error("Error calculating completion percentage:", error);
      return 0;
    }
  }

  async clearAllProgress() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(
        (key) =>
          key.startsWith(ProgressService.PROGRESS_KEY) ||
          key === ProgressService.COMPLETED_COURSES_KEY
      );
      await AsyncStorage.multiRemove(progressKeys);
      console.log("[ProgressService] Cleared all progress data");
    } catch (error) {
      console.error("Error clearing progress:", error);
    }
  }
}

export default new ProgressService();
