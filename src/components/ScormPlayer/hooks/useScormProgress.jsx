import { useEffect } from "react";

export function useScormProgress({
  courseId,
  userId,
  STORAGE_KEY,
  setCurrentItemIndex,
  setCurrentProgress,
}) {
  // Untuk load progress pertama dibuka (nanti GET API)
  useEffect(() => {
    if (!courseId || !userId) return;

    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const progress = allData.find(
      (item) => item.courseId === courseId && item.userId === userId
    );

    setCurrentProgress(progress || null);
    setCurrentItemIndex(Math.min(progress?.lastScoIndex || 0));
  }, [courseId, userId, setCurrentItemIndex]);
}
