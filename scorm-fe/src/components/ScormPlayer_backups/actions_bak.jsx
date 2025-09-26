import { hasScoreBeenSubmitted } from "./lib/utils";

export const actionSaveProgress = ({
  courseId,
  userId,
  API,
  STORAGE_KEY,
  playerBehavior,
  manifestItems,
  currentItemIndex,
  scormVersion,
  currentProgress,
  setCurrentProgress,
  isQuizRepeatable,
}) => {
  if (!API.current) return;

  // Ambil data mentah terbaru dari API dan ubah menjadi objek JSON biasa
  const newCmiData = JSON.parse(JSON.stringify(API.current.cmi));

  const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const progressIndex = allData.findIndex(
    (item) => item.courseId === courseId && item.userId === userId
  );
  const progress = progressIndex > -1 ? allData[progressIndex] : null;
  const existingCmi = progress ? progress.cmi : {};

  // Gabungkan objek JSON lama dengan objek JSON baru. Semuanya konsisten.
  const mergedCmi = {
    ...existingCmi,
    ...newCmiData,
    core: { ...(existingCmi.core || {}), ...(newCmiData.core || {}) },
  };

  let overallStatus = progress?.overallStatus || "incomplete";
  let currentAttempt = progress?.quizAttempt || 0;

  if (playerBehavior === "LMS_HANDLE_NAVIGATION") {
    // handle quizAttemp
    const currentItem = manifestItems[currentItemIndex];
    if (currentItem?.isQuizPage) {
      const hasNewScore = hasScoreBeenSubmitted(newCmiData, scormVersion);
      const hadPreviousScore = hasScoreBeenSubmitted(
        progress?.cmi,
        scormVersion
      );
      if (hasNewScore && !hadPreviousScore) {
        currentAttempt = 1;
        // console.log(`Quiz attempt incremented to: ${currentAttempt}`);
      }
    }

    // handle overAllStatus
    const isLastSco = currentItemIndex === manifestItems.length - 1;

    let newRawStatus;
    if (scormVersion.includes("2004")) {
      newRawStatus = newCmiData.completion_status || newCmiData.success_status;
    } else {
      // Karena `newCmiData` adalah hasil stringify, ia PASTI punya `_lesson_status` jika ada
      newRawStatus =
        newCmiData.core?._lesson_status || newCmiData.core?.lesson_status;
    }

    if (
      isLastSco &&
      (newRawStatus === "completed" || newRawStatus === "passed")
    ) {
      overallStatus = "completed";
    }
  } else {
    overallStatus =
      mergedCmi.core?._lesson_status ||
      mergedCmi.completion_status ||
      "unknown";
  }

  const finalProgress = {
    courseId,
    userId,
    cmi: mergedCmi,
    lastScoIndex: currentItemIndex,
    overallStatus: overallStatus,
    isQuizRepeatable: isQuizRepeatable,
    quizAttempt: currentAttempt,
  };

  // Simpan objek yang sudah konsisten ke localStorage dan state
  if (progressIndex > -1) {
    allData[progressIndex] = finalProgress;
  } else {
    allData.push(finalProgress);
  }

  // hit API untuk save ke BE
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  // update data di lokal juga
  setCurrentProgress(finalProgress);
};
