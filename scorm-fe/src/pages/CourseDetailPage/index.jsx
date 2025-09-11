import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ScormPlayer from "./ScormPlayer";
import { API } from "axiosInstance";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const userId = "user-1";

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await API.get(`/api/courses/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load the course.");
      } finally {
        setLoading(false);
      }
    };

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-red-600">Error: {error}</p>
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
