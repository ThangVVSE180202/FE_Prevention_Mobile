// src/navigation/AppNavigator.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // TODO: Check token here
    setTimeout(() => {
      setIsLoggedIn(false); // set true để test MainTabNavigator
    }, 1000);
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
