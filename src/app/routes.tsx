import React from "react";
import { createHashRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { CaptureFlow } from "./pages/CaptureFlow";
import { DashboardScreen } from "./pages/DashboardScreen";
import { StudentProfileScreen } from "./pages/StudentProfileScreen";
import { ActivitiesScreen } from "./pages/ActivitiesScreen";
import { StudentListScreen } from "./pages/StudentListScreen";
import { ContinuousNfcScreen } from "./pages/ContinuousNfcScreen";
import { ManualCaptureScreen } from "./pages/ManualCaptureScreen";
import { EvaluationCaptureScreen } from "./pages/EvaluationCaptureScreen";
import { WelcomeScreen } from "./pages/WelcomeScreen";
import { LoginScreen } from "./pages/LoginScreen";
import { RegisterScreen } from "./pages/RegisterScreen";
import { ImportStudentsScreen } from "./pages/ImportStudentsScreen";
import { ActivityDetailScreen } from "./pages/ActivityDetailScreen";
import { CalendarScreen } from "./pages/CalendarScreen";
import { AddCalendarEventScreen } from "./pages/AddCalendarEventScreen";
import { PricingScreen } from "./pages/PricingScreen";

export const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <WelcomeScreen /> },
      { path: "welcome", element: <WelcomeScreen /> },
      { path: "login", element: <LoginScreen /> },
      { path: "register", element: <RegisterScreen /> },
      { path: "planes", element: <PricingScreen /> },
      { path: "capture", element: <ContinuousNfcScreen /> },
      { path: "manual-capture", element: <ManualCaptureScreen /> },
      { path: "evaluation-capture", element: <EvaluationCaptureScreen /> },
      { path: "import-students", element: <ImportStudentsScreen /> },
      { path: "dashboard", element: <DashboardScreen /> },
      { path: "student/:id", element: <StudentProfileScreen /> },
      { path: "students", element: <StudentListScreen /> },
      { path: "activities", element: <ActivitiesScreen /> },
      { path: "activity/:id", element: <ActivityDetailScreen /> },
      { path: "calendar", element: <CalendarScreen /> },
      { path: "add-event", element: <AddCalendarEventScreen /> },
    ],
  },
]);
