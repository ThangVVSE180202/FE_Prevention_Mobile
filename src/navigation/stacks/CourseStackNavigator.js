// 📚 Course Stack Navigator
// Navigation stack for course-related screens

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  MyCourseScreen,
  CourseDetailScreen,
  CourseContentScreen,
  CourseReviewScreen,
  FavoriteCourseScreen,
} from "../../screens/courses";

const Stack = createNativeStackNavigator();

const CourseStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MyCourse"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MyCourse"
        component={MyCourseScreen}
        options={{
          title: "Khóa học của tôi",
        }}
      />

      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{
          title: "Chi tiết khóa học",
        }}
      />

      <Stack.Screen
        name="FavoriteCourse"
        component={FavoriteCourseScreen}
        options={{
          title: "Khóa học yêu thích",
        }}
      />

      <Stack.Screen
        name="CourseContent"
        component={CourseContentScreen}
        options={{
          title: "Nội dung khóa học",
        }}
      />

      <Stack.Screen
        name="CourseReview"
        component={CourseReviewScreen}
        options={{
          title: "Đánh giá khóa học",
        }}
      />
    </Stack.Navigator>
  );
};

export default CourseStackNavigator;
