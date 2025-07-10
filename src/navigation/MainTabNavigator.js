import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { HomePage } from "../screens/Home";
import AppointmentStackNavigator from "./stacks/AppointmentStackNavigator";
import { useAuth } from "../context/AuthContext";
// import CoursesScreen from "../screens/courses/CoursesScreen";
// import SurveysScreen from "../screens/surveys/SurveysScreen";
// import ProfileScreen from "../screens/profile/ProfileScreen";

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
        tabBarActiveTintColor: "#1976d2",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Appointments" component={AppointmentStackNavigator} />
      {/* <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="Surveys" component={SurveysScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
