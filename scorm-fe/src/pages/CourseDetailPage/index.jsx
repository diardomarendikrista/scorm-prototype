import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { courses } from "hardCodeData";
import ScormPlayer from "components/ScormPlayer";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const userId = "user-1";

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
      <main className="flex-grow flex items-center justify-center">
        <div className="w-screen h-screen bg-white shadow-lg overflow-hidden ">
          <ScormPlayer
            courseId={courseId}
            userId={userId}
            manifestUrl={course.manifestUrl}
            playerBehavior={course?.playerBehavior}
            quizPage={course?.quizPage}
            maxQuizAttempt={course?.maxQuizAttempt}
            quizAttempt={course?.quizAttempt}
          />
        </div>
      </main>
    </div>
  );
}
