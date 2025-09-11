import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import HomeDashboard from "pages/DashboardPage/HomeDashboard";
import CourseList from "pages/DashboardPage/CourseList";
import CourseForm from "pages/DashboardPage/CourseList/CourseForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/course/:courseId"
          element={<CourseDetailPage />}
        />

        {/* dashboard routes */}

        <Route
          path="/dashboard"
          element={<HomeDashboard />}
        />
        <Route
          path="/dashboard/courses"
          element={<CourseList />}
        />
        <Route
          path="/dashboard/courses/new"
          element={<CourseForm />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
