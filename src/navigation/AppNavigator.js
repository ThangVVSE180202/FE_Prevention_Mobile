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
const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // TODO: kiểm tra token AsyncStorage ở đây
    setTimeout(() => {
      setIsLoggedIn(false); // or true to test
    }, 1000);
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Luôn khai báo cả 2 màn hình */}
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Main" component={MainTabNavigator} />
        <RootStack.Screen name="BlogList" component={BlogList} />
        <RootStack.Screen name="SurveyList" component={SurveyList} />
        <RootStack.Screen name="SurveyDetail" component={SurveyDetail} />
        <RootStack.Screen name="SurveySubmit" component={SurveySubmit} />
        <RootStack.Screen name="BlogDetail" component={BlogDetail} />
        <RootStack.Screen name="SurveyResult" component={SurveyResult} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
