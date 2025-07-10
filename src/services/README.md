# 🌐 API Services Documentation

This folder contains all API service modules for the Prevention Mobile App. Each service handles specific functionality and provides easy-to-use methods for your components.

## 📋 Available Services

### 🔐 **authService.js**

Authentication and authorization functionality.

**Key Methods:**

- `signup(userData)` - Register new user
- `login(credentials)` - User login
- `googleLogin(token)` - Google OAuth login
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, passwordData)` - Reset password
- `isAuthenticated()` - Check if user is logged in
- `getCurrentUser()` - Get current user data
- `logout()` - Clear user session

### 📚 **courseService.js**

Course management and enrollment functionality.

**Key Methods:**

- `getCourses(params)` - Get course list with filters
- `getCourseById(courseId)` - Get course details
- `enrollInCourse(courseId)` - Enroll in a course
- `addCourseReview(courseId, reviewData)` - Add course review
- `getCourseReviews(courseId)` - Get course reviews
- `getCoursesByAudience(targetAudience)` - Filter by audience
- `searchCourses(searchTerm)` - Search courses

### 📝 **surveyService.js**

Survey and risk assessment functionality.

**Key Methods:**

- `getSurveys()` - Get available surveys
- `getSurveyById(surveyId)` - Get survey details
- `submitSurvey(surveyId, answers)` - Submit survey answers
- `getRiskLevel(score, maxScore)` - Calculate risk level
- `validateAnswers(survey, answers)` - Validate before submission
- `calculateScore(survey, answers)` - Calculate total score

### 📰 **blogService.js**

Blog content and article functionality.

**Key Methods:**

- `getBlogs(params)` - Get blog list with filters
- `getBlogById(blogId)` - Get blog details
- `getFeaturedBlogs(limit)` - Get featured articles
- `getRecentBlogs(limit)` - Get recent articles
- `searchBlogs(searchTerm)` - Search blog content
- `getBlogsByCategory(category)` - Filter by category

### 📅 **appointmentService.js**

Appointment booking and management functionality.

**Key Methods:**

- `createTimeSlots(slots)` - Create time slots (consultant)
- `getConsultantSlots(consultantId)` - Get available slots
- `bookAppointmentSlot(slotId)` - Book an appointment
- `getMyAppointments()` - Get user's appointments
- `cancelAppointment(appointmentId)` - Cancel appointment
- `formatTimeSlot(slot)` - Format for display
- `groupSlotsByDate(slots)` - Group slots by date

### 👤 **userService.js**

User profile and management functionality.

**Key Methods:**

- `getCurrentUserProfile()` - Get current user profile
- `updateCurrentUserProfile(userData)` - Update profile
- `getAllUsers(params)` - Get all users (admin)
- `getUsersByRole(role)` - Get users by role
- `getConsultants()` - Get consultant list
- `changePassword(passwordData)` - Change password
- `getCurrentUserEnrollments()` - Get user's courses
- `getCurrentUserSurveyResults()` - Get survey history

## 🔧 Usage Examples

### Authentication Flow

```javascript
import { authService } from "../services/api";

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await authService.login({ email, password });
    // Handle success
    console.log("Login successful:", response.data.user);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};
```

### Course Enrollment

```javascript
import { courseService } from "../services/api";

// Get courses for students
const fetchStudentCourses = async () => {
  try {
    const response = await courseService.getCoursesByAudience("student");
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch courses:", error.message);
  }
};

// Enroll in course
const enrollCourse = async (courseId) => {
  try {
    const response = await courseService.enrollInCourse(courseId);
    console.log("Enrollment successful");
  } catch (error) {
    console.error("Enrollment failed:", error.message);
  }
};
```

### Survey Submission

```javascript
import { surveyService } from "../services/api";

// Submit survey
const submitSurvey = async (surveyId, answers) => {
  try {
    // Validate first
    const survey = await surveyService.getSurveyById(surveyId);
    const errors = surveyService.validateAnswers(survey.data.data, answers);

    if (errors.length > 0) {
      console.error("Validation errors:", errors);
      return;
    }

    const response = await surveyService.submitSurvey(surveyId, answers);
    const result = surveyService.formatSurveyResult(response.data.result);

    console.log("Survey result:", result);
  } catch (error) {
    console.error("Survey submission failed:", error.message);
  }
};
```

### Appointment Booking

```javascript
import { appointmentService } from "../services/api";

// Get and display available slots
const getAvailableSlots = async (consultantId) => {
  try {
    const response = await appointmentService.getConsultantSlots(consultantId);
    const groupedSlots = appointmentService.groupSlotsByDate(
      response.data.slots
    );

    return groupedSlots;
  } catch (error) {
    console.error("Failed to fetch slots:", error.message);
  }
};

// Book appointment
const bookSlot = async (slotId) => {
  try {
    const response = await appointmentService.bookAppointmentSlot(slotId);
    console.log("Appointment booked:", response.data.appointment);
  } catch (error) {
    if (error.message.includes("409")) {
      console.error("Slot already booked");
    } else {
      console.error("Booking failed:", error.message);
    }
  }
};
```

## 🛡️ Error Handling

All services include consistent error handling:

```javascript
try {
  const response = await serviceMethod();
  // Handle success
} catch (error) {
  // Error object contains:
  // - error.message: User-friendly error message
  // - HTTP status codes are handled automatically
  console.error(error.message);
}
```

## 🔄 Authentication Integration

Services that require authentication automatically include the JWT token:

- `courseService.enrollInCourse()`
- `surveyService.submitSurvey()`
- `appointmentService.bookAppointmentSlot()`
- `userService.updateCurrentUserProfile()`

The token is managed by `authService` and automatically added to requests.

## 📱 React Native Considerations

For React Native apps, consider updating `authService.js` to use:

- `AsyncStorage` instead of `localStorage`
- `react-native-keychain` for secure token storage
- Platform-specific error handling

## 🎯 Next Steps

1. **Install Dependencies**: Make sure to install required packages
2. **Update Storage**: Modify authService for React Native storage
3. **Add Error Boundaries**: Implement global error handling
4. **Add Loading States**: Integrate with loading management
5. **Add Offline Support**: Consider offline data caching

---

**Ready to use! 🚀**
