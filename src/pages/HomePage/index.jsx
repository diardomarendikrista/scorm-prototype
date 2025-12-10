import { courses } from "data/courseData";
import React from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";

export default function HomePage() {
  const handleClearProgress = () => {
    if (window.confirm("Are you sure you want to clear all SCORM progress?")) {
      localStorage.removeItem("scorm-prototype");
      alert("All progress cleared!");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Available Courses
          </h1>

          <button
            onClick={handleClearProgress}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            <FiTrash2 className="w-5 h-5" />
            Clear All Progress
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              target="_blank"
            >
              <h2 className="text-2xl font-bold text-blue-600">
                {course.title}
              </h2>
              <p className="text-slate-600 mt-2">{course.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
