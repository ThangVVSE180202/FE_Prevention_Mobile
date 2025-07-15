import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
    ProfileScreen,
    EditProfileScreen,
} from "../../screens/profile";

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Profile"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: "Profile",
                }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    title: "Edit Profile",
                }}
            />
        </Stack.Navigator>
    );
}

export default ProfileStackNavigator;