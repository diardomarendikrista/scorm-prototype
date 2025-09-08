import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import ScormPlayer from "./components/ScormPlayer";
import CourseSidebar from "./components/CourseSidebar";
import useScormManifest from "./hooks/useScormManifest";
import useScormProgress from "./hooks/useScormProgress";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const userId = "user-1"; // User ID bisa dibuat dinamis nanti

  const manifestUrl = `/scorm-content/${courseId}/imsmanifest.xml`;

  const manifestData = useScormManifest(manifestUrl);
  const progressData = useScormProgress(courseId, userId);

  const courseDisplayData = useMemo(() => {
    if (!manifestData) return null;
    return {
      ...manifestData,
      author: "Learning Team",
      duration: 45,
      score: progressData?.score || 0,
      status: progressData?.status?.toUpperCase() || "NOT STARTED",
      location: progressData?.location,
    };
  }, [manifestData, progressData]);

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
      {courseDisplayData ? (
        <CourseSidebar courseData={courseDisplayData} />
      ) : (
        <aside className="w-full md:w-96 flex-shrink-0 bg-white p-6 animate-pulse">
          <p>Loading course details...</p>
        </aside>
      )}

      <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
        <div className="w-full h-full max-w-5xl max-h-[720px] bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <ScormPlayer
            courseId={courseId}
            userId={userId}
          />
        </div>
      </main>
    </div>
  );
}
