import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CourseDetailPage from "./pages/CourseDetailPage";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
