import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";

// Layout
import MainLayout from "../layouts/MainLayout";

// Student
import Profile from "../pages/student/Profile";
import Attendance from "../pages/student/Attendance";
import FaceRegistration from "../pages/student/FaceRegistration";
import ResLesson from "../pages/student/ResLesson";
import AttendanceHistory from "../pages/student/AttendanceHistory";
import AttendanceDetail from "../pages/student/AttendanceDetail";

// Teacher
import TeacherProfile from "../pages/teacher/Profile";
import ClassManagement from "../pages/teacher/ClassManagement";
import AttendanceManagementClass from "../pages/teacher/AttendanceManagementClass";
import AttendanceManagement from "../pages/teacher/AttendanceManagement";
import Statistics from "../pages/teacher/Statistics";
import ClassStatistics from "../pages/teacher/ClassStatistics";
import AttendanceProcess from "../pages/teacher/AttendanceProcess";

// Admin
import AccountManagement from "../pages/admin/AccountManagement";
import AttendanceReport from "../pages/admin/AttendanceReport";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />

        {/* STUDENT ROUTES - PROTECTED */}
        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/student" element={<MainLayout />}>
            <Route index element={<Navigate to="/student/profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="register-face" element={<FaceRegistration />} />
            <Route path="attendance/resLesson" element={<ResLesson />} />
            <Route path="attendance-history" element={<AttendanceHistory />} />
            <Route path="attendance/:subjectId" element={<AttendanceDetail />} />
          </Route>
        </Route>

        {/* TEACHER ROUTES - PROTECTED */}
        <Route element={<ProtectedRoute requiredRole="teacher" />}>
          <Route path="/teacher" element={<MainLayout />}>
            <Route index element={<Navigate to="/teacher/profile" replace />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="attendance" element={<AttendanceManagementClass />} />
            <Route path="attendance/:classId" element={<AttendanceManagement />} />
            <Route path="statistics/:sessionId" element={<Statistics />} />
            <Route path="class-statistics/:classId" element={<ClassStatistics />} />
            <Route path="attendance/process/:sessionId" element={<AttendanceProcess />} />
          </Route>
        </Route>

        {/* ADMIN ROUTES - PROTECTED */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<MainLayout />}>
            <Route index element={<Navigate to="/admin/accounts" replace />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="attendance-report" element={<AttendanceReport />} />
          </Route>
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
