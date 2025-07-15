import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { HomePage } from "../screens/Home";
import AppointmentStackNavigator from "./stacks/AppointmentStackNavigator";
import CourseStackNavigator from "./stacks/CourseStackNavigator";
import SearchStackNavigator from "./stacks/SearchStackNavigator";
import FavoriteStackNavigator from "./stacks/FavoriteStackNavigator";
import ProfileStackNavigator from "./stacks/ProfileStackNavigator"
import { useAuth } from "../context/AuthContext";
// import { ProfileScreen } from "../screens/profile";
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { user } = useAuth();

  // Debug: Log user and role in main tab navigator
  console.log("[MainTabNavigator] user:", user);
  console.log("[MainTabNavigator] user.role:", user?.role);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Appointments":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Courses":
              iconName = focused ? "book" : "book-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Favorites":
              iconName = focused ? "heart" : "heart-outline";
              break;
            case "Surveys":
              iconName = focused ? "list" : "list-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6B7280",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          title: "Trang chủ",
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CourseStackNavigator}
        options={{
          title: "Học tập",
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: "Tìm kiếm",
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoriteStackNavigator}
        options={{
          title: "Yêu thích",
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentStackNavigator}
        options={{
          title: "Lịch hẹn",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: "Hồ sơ",
        }}
      />
      {/* <Tab.Screen name="Surveys" component={SurveysScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
