import { useEffect, useState } from "react";

export default function useScormProgress(courseId, userId) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const key = `scorm-progress-${courseId}-${userId}`;
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    if (saved?.core) {
      setProgress({
        status: saved.core.lesson_status || "incomplete",
        location: parseInt(saved.core.lesson_location || "0", 10),
        score: saved.core.score?.raw || 0,
      });
    }
  }, [courseId, userId]);

  return progress;
}
