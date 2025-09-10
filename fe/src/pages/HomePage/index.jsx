import { courses } from "hardCodeData";
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">
          Available Courses
        </h1>
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
