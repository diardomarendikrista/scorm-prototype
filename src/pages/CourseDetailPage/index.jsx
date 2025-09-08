// src/pages/CourseDetailPage.js

import React, { useMemo } from "react";
import { useParams } from "react-router-dom"; // Hook untuk mengambil parameter URL

import ScormPlayer from "./components/ScormPlayer";
import CourseSidebar from "./components/CourseSidebar";
import useScormManifest from "./hooks/useScormManifest";
import useScormProgress from "./hooks/useScormProgress";

export default function CourseDetailPage() {
  // 1. Ambil courseId dari URL, contoh: "golf" atau "marketing"
  const { courseId } = useParams();
  const userId = "user-1"; // User ID bisa dibuat dinamis nanti

  // 2. Buat URL manifest menjadi dinamis berdasarkan courseId
  const manifestUrl = `/scorm-content/${courseId}/imsmanifest.xml`;

  // Panggil hooks dengan data dinamis
  const manifestData = useScormManifest(manifestUrl);
  const progressData = useScormProgress(courseId, userId);

  // Gabungkan data (logika ini tetap sama)
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

  // JSX untuk layout halaman detail (sama seperti App.js lama Anda)
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
