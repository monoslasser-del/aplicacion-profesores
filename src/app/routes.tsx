import React from "react";
import { createHashRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { CaptureFlow } from "./pages/CaptureFlow";
import { DashboardScreen } from "./pages/DashboardScreen";
import { StudentProfileScreen } from "./pages/StudentProfileScreen";
import { StudentAttendanceScreen } from "./pages/students/StudentAttendanceScreen";
import { StudentWorksScreen } from "./pages/students/StudentWorksScreen";
import { RecordsView } from "./pages/RecordsView";
import { StudentListScreen } from "./pages/StudentListScreen";
import { CaptureView } from "./pages/CaptureView";
import { EvaluationCaptureScreen } from "./pages/EvaluationCaptureScreen";
import { WelcomeScreen } from "./pages/WelcomeScreen";
import { LoginScreen } from "./pages/LoginScreen";
import { RegisterScreen } from "./pages/RegisterScreen";
import { ImportStudentsScreen } from "./pages/ImportStudentsScreen";
import { ActivityDetailScreen } from "./pages/ActivityDetailScreen";
import { CalendarScreen } from "./pages/CalendarScreen";
import { AddCalendarEventScreen } from "./pages/AddCalendarEventScreen";
import { PricingScreen } from "./pages/PricingScreen";
import { ExamBuilderScreen } from "./pages/ExamBuilderScreen";
import { ExamBuilderStep2Screen } from "./pages/ExamBuilderStep2Screen";
import { TeacherProfileScreen } from "./pages/TeacherProfileScreen";
import { DescriptiveCardsScreen } from "./pages/DescriptiveCardsScreen";
import { NotificationsScreen } from "./pages/NotificationsScreen";

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
      { path: "manual-capture", element: <CaptureView /> },
      { path: "evaluation-capture", element: <EvaluationCaptureScreen /> },
      { path: "import-students", element: <ImportStudentsScreen /> },
      { path: "dashboard", element: <DashboardScreen /> },
      { path: "student/:id", element: <StudentProfileScreen /> },
      { path: "student/:id/attendance", element: <StudentAttendanceScreen /> },
      { path: "student/:id/works", element: <StudentWorksScreen /> },
      { path: "students", element: <StudentListScreen /> },
      { path: "activities", element: <RecordsView /> },
      { path: "capture", element: <CaptureView /> }, // Re-add /capture pointing to CaptureView!
      { path: "records", element: <RecordsView /> }, // Alias for records
      { path: "activity/:id", element: <ActivityDetailScreen /> },
      { path: "calendar", element: <CalendarScreen /> },
      { path: "add-event", element: <AddCalendarEventScreen /> },
      { path: "exam-builder", element: <ExamBuilderScreen /> },
      { path: "exam-builder-step2", element: <ExamBuilderStep2Screen /> },
      { path: "perfil", element: <TeacherProfileScreen /> },
      { path: "fichas", element: <DescriptiveCardsScreen /> },
      { path: "notificaciones", element: <NotificationsScreen /> },
    ],
  },
]);
