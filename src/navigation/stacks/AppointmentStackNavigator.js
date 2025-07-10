import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";

import {
  AppointmentDetailScreen,
  AppointmentBookingScreen,
  AvailableSlotsScreen,
  ConsultantListScreen,
  ConsultantDetailScreen,
  MyAppointmentsScreen,
  MySlotsScreen,
  CreateSlotsScreen,
} from "../../screens/appointments";

const Stack = createNativeStackNavigator();

const AppointmentStackNavigator = () => {
  const { user } = useAuth();

  // Debug: Log user and role at navigation render
  console.log("[AppointmentStackNavigator] user:", user);
  console.log("[AppointmentStackNavigator] user.role:", user?.role);

  return (
    <Stack.Navigator
      initialRouteName={
        user?.role === "consultant" ? "MySlots" : "ConsultantList"
      }
    >
      {/* Common screens for all users */}
      <Stack.Screen
        name="ConsultantList"
        component={ConsultantListScreen}
        options={{ title: "Consultants" }}
      />
      <Stack.Screen
        name="ConsultantDetail"
        component={ConsultantDetailScreen}
        options={{ title: "Consultant Details" }}
      />
      <Stack.Screen
        name="AvailableSlots"
        component={AvailableSlotsScreen}
        options={{ title: "Available Slots" }}
      />

      {/* Member-only screens */}
      {user?.role === "member" && (
        <Stack.Screen
          name="AppointmentBooking"
          component={AppointmentBookingScreen}
          options={{ title: "Book Appointment" }}
        />
      )}

      {/* Consultant-only screens */}
      {user?.role === "consultant" && (
        <>
          <Stack.Screen
            name="MySlots"
            component={MySlotsScreen}
            options={{ title: "My Time Slots" }}
          />
          <Stack.Screen
            name="CreateSlots"
            component={CreateSlotsScreen}
            options={{ title: "Create Time Slots" }}
          />
        </>
      )}

      {/* Common screens for authenticated users */}
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: "Appointment Details" }}
      />
      <Stack.Screen
        name="MyAppointments"
        component={MyAppointmentsScreen}
        options={{ title: "My Appointments" }}
      />
    </Stack.Navigator>
  );
};

export default AppointmentStackNavigator;
