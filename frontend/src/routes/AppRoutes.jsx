import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import Login from "../pages/auth/Login";

// Layout
import MainLayout from "../layouts/MainLayout";

// Student
import Dashboard from "../pages/student/Dashboard";
import Profile from "../pages/student/Profile";
import Attendance from "../pages/student/Attendance";
import AttendanceHistory from "../pages/student/AttendanceHistory";

// Teacher
import TeacherProfile from "../pages/teacher/Profile";
import ClassManagement from "../pages/teacher/ClassManagement";
import AttendanceManagement from "../pages/teacher/AttendanceManagement";
import Statistics from "../pages/teacher/Statistics";

// Admin
import AccountManagement from "../pages/admin/AccountManagement";
import AttendanceReport from "../pages/admin/AttendanceReport";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* STUDENT ROUTES */}
        <Route path="/student" element={<MainLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="attendance-history" element={<AttendanceHistory />} />
        </Route>

        {/* TEACHER ROUTES */}
        <Route path="/teacher" element={<MainLayout />}>
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<MainLayout />}>
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="attendance-report" element={<AttendanceReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;