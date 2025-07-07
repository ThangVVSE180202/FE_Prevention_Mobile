// 📝 Survey Service
// Handles all survey and assessment-related API calls

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";
import authService from "./authService";

class SurveyService {
  // Helper method for making API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get list of surveys (Authenticated)
  async getSurveys() {
    return authService.authenticatedRequest(ENDPOINTS.SURVEYS.LIST, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get survey details (Authenticated)
  async getSurveyById(surveyId) {
    return authService.authenticatedRequest(
      ENDPOINTS.SURVEYS.DETAIL(surveyId),
      {
        method: HTTP_METHODS.GET,
      }
    );
  }

  // Submit survey answers (Authenticated)
  async submitSurvey(surveyId, answers) {
    return authService.authenticatedRequest(
      ENDPOINTS.SURVEYS.SUBMIT(surveyId),
      {
        method: HTTP_METHODS.POST,
        body: JSON.stringify({ answers }),
      }
    );
  }

  // Helper method to calculate risk level based on score
  getRiskLevel(score, maxScore) {
    const percentage = (score / maxScore) * 100;

    if (percentage <= 30) {
      return {
        level: "low",
        label: "Nguy cơ thấp",
        color: "#4CAF50",
      };
    } else if (percentage <= 70) {
      return {
        level: "medium",
        label: "Nguy cơ trung bình",
        color: "#FF9800",
      };
    } else {
      return {
        level: "high",
        label: "Nguy cơ cao",
        color: "#F44336",
      };
    }
  }

  // Format survey result for display
  formatSurveyResult(result) {
    const riskLevel = this.getRiskLevel(
      result.totalScore,
      result.maxPossibleScore || 100
    );

    return {
      ...result,
      riskLevel,
      formattedDate: new Date(result.createdAt).toLocaleDateString("vi-VN"),
    };
  }

  // Get user's survey history (if endpoint exists)
  async getUserSurveyHistory() {
    return authService.authenticatedRequest("/surveys/my-results", {
      method: HTTP_METHODS.GET,
    });
  }

  // Validate survey answers before submission
  validateAnswers(survey, answers) {
    const errors = [];

    if (!answers || !Array.isArray(answers)) {
      errors.push("Câu trả lời không hợp lệ");
      return errors;
    }

    // Check if all questions are answered
    for (let i = 0; i < survey.questions.length; i++) {
      const answer = answers.find((a) => a.questionIndex === i);
      if (!answer) {
        errors.push(`Vui lòng trả lời câu hỏi ${i + 1}`);
      } else if (
        answer.optionIndex < 0 ||
        answer.optionIndex >= survey.questions[i].options.length
      ) {
        errors.push(`Lựa chọn cho câu hỏi ${i + 1} không hợp lệ`);
      }
    }

    return errors;
  }

  // Calculate total score locally (for preview)
  calculateScore(survey, answers) {
    let totalScore = 0;

    answers.forEach((answer) => {
      if (
        survey.questions[answer.questionIndex] &&
        survey.questions[answer.questionIndex].options[answer.optionIndex]
      ) {
        totalScore +=
          survey.questions[answer.questionIndex].options[answer.optionIndex]
            .score;
      }
    });

    return totalScore;
  }
}

export default new SurveyService();
