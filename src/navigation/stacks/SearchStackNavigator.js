// 🔍 Search Stack Navigator
// Navigation stack for search course screens

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  SearchCourseScreen,
  CourseDetailScreen,
  CourseContentScreen,
  CourseReviewScreen,
} from "../../screens/courses";

const Stack = createNativeStackNavigator();

const SearchStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SearchList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="SearchList"
        component={SearchCourseScreen}
        options={{
          title: "Tìm kiếm khóa học",
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

export default SearchStackNavigator;
