import React, {
  useEffect,
  // useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";

import ScormPlayer from "./components/ScormPlayer";
// import CourseSidebar from "./components/CourseSidebar";
// import useScormManifest from "./hooks/useScormManifest";
// import useScormProgress from "./hooks/useScormProgress";
import { courses } from "hardCodeData";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const userId = "user-1"; // TODO: dinamis dari auth

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCourse() {
      try {
        setLoading(true);

        // nanti disini panggil API
        const data = courses.find((c) => c.id === courseId) || null;

        if (isMounted) setCourse(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setCourse(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // Ambil manifest & progress
  // const manifestData = useScormManifest(course?.manifestUrl);
  // const progressData = useScormProgress(courseId, userId);

  // Gabungkan data untuk sidebar
  // const courseDisplayData = useMemo(() => {
  //   if (!manifestData) return null;
  //   return {
  //     ...manifestData,
  //     author: course.author || "Learning Team",
  //     duration: course.duration || 45,
  //     score: progressData?.score || 0,
  //     status: progressData?.status?.toUpperCase() || "NOT STARTED",
  //     location: progressData?.location,
  //   };
  // }, [manifestData, progressData, course]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="animate-pulse text-slate-500">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold text-red-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
      {/* {courseDisplayData ? (
        <CourseSidebar courseData={courseDisplayData} />
      ) : (
        <aside className="w-full md:w-96 flex-shrink-0 bg-white p-6 animate-pulse">
          <p>Loading course details...</p>
        </aside>
      )} */}

      <main className="flex-grow flex items-center justify-center">
        <div className="w-full h-full bg-white shadow-lg overflow-hidden ">
          <ScormPlayer
            courseId={courseId}
            userId={userId}
            scormUrl={course.scormUrl}
            manifestUrl={course.manifestUrl}
          />
        </div>
      </main>
    </div>
  );
}
