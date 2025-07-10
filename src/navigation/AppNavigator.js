import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";
import BlogList from "../screens/blog/BlogList";
import SurveyList from "../screens/surveys/SurveyList";
import SurveyDetail from "../screens/surveys/SurveyDetail";
import SurveySubmit from "../screens/surveys/SurveySubmit";
import BlogDetail from "../screens/blog/BlogDetail";
import SurveyResult from "../screens/surveys/SurveyResult";
import HomePage from "../screens/Home/HomePage";
import { useAuth } from "../context/AuthContext";

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Debug: Log user and auth state
  console.log("[AppNavigator] user:", user);
  console.log("[AppNavigator] user.role:", user?.role);
  console.log("[AppNavigator] loading:", loading);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Not logged in - show auth screens
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Logged in - show main app screens
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen name="BlogList" component={BlogList} />
            <RootStack.Screen name="SurveyList" component={SurveyList} />
            <RootStack.Screen name="SurveyDetail" component={SurveyDetail} />
            <RootStack.Screen name="SurveySubmit" component={SurveySubmit} />
            <RootStack.Screen name="BlogDetail" component={BlogDetail} />
            <RootStack.Screen name="SurveyResult" component={SurveyResult} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
