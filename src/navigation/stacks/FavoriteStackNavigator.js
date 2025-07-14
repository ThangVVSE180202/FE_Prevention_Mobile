// 💖 Favorite Stack Navigator
// Navigation stack for favorite course screens

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  FavoriteCourseScreen,
  CourseDetailScreen,
  CourseContentScreen,
  CourseReviewScreen,
} from "../../screens/courses";

const Stack = createNativeStackNavigator();

const FavoriteStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="FavoriteList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="FavoriteList"
        component={FavoriteCourseScreen}
        options={{
          title: "Khóa học yêu thích",
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

export default FavoriteStackNavigator;
