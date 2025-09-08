import useScormProgress from "pages/CourseDetailPage/hooks/useScormProgress";
import React, { useState } from "react";
import {
  FiBookOpen,
  FiUser,
  FiClock,
  FiGrid,
  FiBarChart2,
  FiCheckCircle,
} from "react-icons/fi";

export default function CourseSidebar({
  courseData,
  courseId = "aaa",
  userId = "user-1",
}) {
  const progress = useScormProgress(courseId, userId);
  const [activeModule, setActiveModule] = useState(progress?.location || 0);

  const displayData = {
    author: "Learning Team",
    duration: 45,
    slides: 12,
    score: progress?.score || "-",
    status: progress?.status?.toUpperCase() || "NOT STARTED",
    ...courseData,
  };

  return (
    <aside className="w-full md:w-96 flex-shrink-0 bg-white p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Card info */}
      <div className="border border-slate-200 rounded-lg p-5">
        <div className="flex justify-between items-start mb-4">
          <FiBookOpen className="text-blue-500 text-4xl" />
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
            {displayData?.status}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {displayData?.title}
        </h1>
        <p className="text-slate-500 mt-1 mb-6">{displayData?.description}</p>
        <div className="space-y-3 text-slate-600">
          <div className="flex items-center gap-3">
            <FiUser /> {displayData?.author}
          </div>
          <div className="flex items-center gap-3">
            <FiClock /> {displayData?.duration} minutes
          </div>
          <div className="flex items-center gap-3">
            <FiGrid /> {displayData?.slides} slides
          </div>
          <div className="flex items-center gap-3">
            <FiBarChart2 /> Score: {displayData?.score}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="border border-slate-200 rounded-lg p-5 flex-grow">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Course Content
        </h2>
        <nav>
          <ul className="space-y-1">
            {displayData.modules.map((module, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={() => setActiveModule(index)}
                  className={`flex flex-col px-4 py-3 rounded-md transition-all duration-200 ${
                    activeModule === index
                      ? "bg-blue-100 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{module.title}</span>
                  {module.status !== "Not Started" && (
                    <span
                      className={`text-xs flex items-center gap-1 mt-1 ${
                        module.status === "Viewed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      <FiCheckCircle /> {module.status}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
