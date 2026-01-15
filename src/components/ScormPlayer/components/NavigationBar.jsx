import { useCallback, useMemo, useState } from "react";
import QuizScoreDisplay from "./QuizScoreDisplay";
import "./navigationbar.css";

export default function NavigationBar({
  courseId,
  userId,
  manifestItems,
  currentItemIndex,
  setCurrentItemIndex,
  currentProgress,
  setIsReloading,
  playerBehavior,
  scormVersion,
  isQuizRepeatable,
  isMultiPageQuiz,
}) {
  const [isRetryDisabled, setIsRetryDisabled] = useState(false);

  // --- Navigasi ---
  const handlePrevious = useCallback(() => {
    if (currentItemIndex > 0) setCurrentItemIndex((prev) => prev - 1);
  }, [currentItemIndex]);

  const handleNext = useCallback(() => {
    if (currentItemIndex < manifestItems.length - 1)
      setCurrentItemIndex((prev) => prev + 1);
  }, [currentItemIndex, manifestItems.length]);

  // masih buggy, nanti dicek lagi
  const handleRetryQuiz = useCallback(() => {
    // Trigger iframe reload
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
    }, 10);

    // Re-enable button after 3 seconds
    setTimeout(() => {
      setIsRetryDisabled(false);
    }, 3000);
  }, [courseId, userId, currentProgress, setIsReloading]);

  // --- flags logic ---
  const isNextDisabled = useMemo(() => {
    if (manifestItems.length === 0) {
      return currentItemIndex >= manifestItems.length - 1;
    }

    const currentItem = manifestItems[currentItemIndex];

    const cmi = currentProgress?.cmi || {};

    // cek apakah ini halaman quiz & sudah passed
    let isQuizAttempted = false;
    if (scormVersion.includes("2004")) {
      isQuizAttempted = cmi?.score?.raw !== "";
    } else {
      // SCORM 1.2
      // Dianggap sudah dicoba jika skor sudah terisi
      const scoreValue = cmi.core?.score?.raw;
      isQuizAttempted = scoreValue !== undefined && scoreValue !== "";
    }

    // tapi kalau isMultiPageQuiz, maka next dinyalakan terus
    if (isMultiPageQuiz) return false;

    // console.log(isQuizAttempted, "isQuizAttempted");
    // console.log(currentItem?.isQuizPage, "currentItem?.isQuizPage");
    // console.log(cmi?.core, "cmi");

    // Syarat next disabled
    return (
      currentItemIndex >= manifestItems.length - 1 ||
      (currentItem?.isQuizPage && !isQuizAttempted)
    );
  }, [
    currentProgress,
    currentItemIndex,
    manifestItems,
    playerBehavior,
    scormVersion,
  ]);

  const isFinishDisabled = useMemo(() => {
    const currentItem = manifestItems[currentItemIndex];

    // Jika halaman terakhir BUKAN kuis, tombol langsung aktif
    if (
      !currentItem?.isQuizPage ||
      (currentItem?.isQuizPage && isMultiPageQuiz)
    ) {
      return false;
    }

    // Jika halaman terakhir ADALAH kuis, kita perlu cek apakah sudah dikerjakan
    const cmi = currentProgress?.cmi || {};
    let isQuizAttempted = false;

    if (scormVersion.includes("2004")) {
      // Dianggap sudah dicoba jika status bukan 'not attempted' atau skor ada
      isQuizAttempted =
        cmi.completion_status !== "not attempted" ||
        (cmi.score?.raw !== undefined && cmi.score?.raw !== "");
    } else {
      // SCORM 1.2
      // Dianggap sudah dicoba jika skor sudah terisi
      const scoreValue = cmi.core?.score?.raw;
      isQuizAttempted = scoreValue !== undefined && scoreValue !== "";
    }

    // Tombol Close akan nonaktif jika ini halaman kuis DAN belum dikerjakan
    return !isQuizAttempted;
  }, [currentProgress, currentItemIndex, manifestItems, scormVersion]);

  const showRetryButton = useMemo(() => {
    // Tombol hanya relevan di mode LMS_HANDLE_NAVIGATION
    if (playerBehavior !== "LMS_HANDLE_NAVIGATION") return false;

    const currentItem = manifestItems[currentItemIndex];
    // Tampilkan hanya jika ini adalah halaman kuis
    if (!currentItem?.isQuizPage || !isQuizRepeatable) return false;

    const cmi = currentProgress?.cmi || {};
    let isAttempted = false;

    if (scormVersion.includes("2004")) {
      isAttempted = cmi?.score?.raw !== "";
    } else {
      // SCORM 1.2
      // Untuk 1.2, dianggap sudah dicoba jika skor sudah terisi
      const scoreValue = cmi.core?.score?.raw;
      isAttempted = scoreValue !== undefined && scoreValue !== "";
    }

    return isAttempted;
  }, [
    currentProgress,
    currentItemIndex,
    manifestItems,
    playerBehavior,
    scormVersion,
    isQuizRepeatable,
  ]);

  const progressPercent = ((currentItemIndex + 1) / manifestItems.length) * 100;

  return (
    <div className="scorm-nav-container">
      {/* Progress Bar */}
      <div className="scorm-nav-progress-wrapper">
        <div className="scorm-nav-progress-track">
          <div
            className="scorm-nav-progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentItemIndex === 0}
        className="scorm-nav-btn scorm-nav-btn-prev"
      >
        <span>&lt;</span>
        <span className="scorm-nav-btn-text">Previous</span>
      </button>

      {/* Title & Score Center */}
      <div className="scorm-nav-center">
        <span className="scorm-nav-title">
          {manifestItems[currentItemIndex]?.title}
        </span>
        {manifestItems[currentItemIndex]?.isQuizPage && !isMultiPageQuiz && (
          <div className="scorm-nav-score">
            <QuizScoreDisplay
              progress={currentProgress}
              scormVersion={scormVersion}
            />
          </div>
        )}
      </div>

      {/* Right Side Buttons */}
      <div className="scorm-nav-actions">
        {showRetryButton && (
          <button
            onClick={handleRetryQuiz}
            className="scorm-nav-btn scorm-nav-btn-retry"
            disabled={isRetryDisabled}
          >
            <span>⟳</span>
            <span className="scorm-nav-btn-text">Retry Quiz</span>
          </button>
        )}

        {currentItemIndex < manifestItems.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="scorm-nav-btn scorm-nav-btn-next"
          >
            <span className="scorm-nav-btn-text">Next</span>
            <span>&gt;</span>
          </button>
        ) : (
          <button
            onClick={() => window.close()}
            disabled={isFinishDisabled}
            className="scorm-nav-btn scorm-nav-btn-finish"
          >
            <span>🚩</span>
            <span className="scorm-nav-btn-text">Finish</span>
          </button>
        )}
      </div>
    </div>
  );
}
