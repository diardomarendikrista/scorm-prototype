import { useCallback, useMemo } from "react";
import QuizScoreDisplay from "./QuizScoreDisplay";
import { cn } from "lib/utils";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiRestartLine,
  RiFlagLine,
} from "react-icons/ri";

export default function NavigationBar({
  manifestItems,
  currentItemIndex,
  setCurrentItemIndex,
  currentProgress,
  setIsReloading,
  playerBehavior,
  scormVersion,
}) {
  // --- Navigasi ---
  const handlePrevious = useCallback(() => {
    if (currentItemIndex > 0) setCurrentItemIndex((prev) => prev - 1);
  }, [currentItemIndex]);

  const handleNext = useCallback(() => {
    if (currentItemIndex < manifestItems.length - 1)
      setCurrentItemIndex((prev) => prev + 1);
  }, [currentItemIndex, manifestItems.length]);

  const handleRetryQuiz = useCallback(() => {
    setIsReloading(true);

    // refresh quiz
    setTimeout(() => {
      setIsReloading(false);
    }, 10);
  }, []);

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

    console.log(isQuizAttempted, "isQuizAttempted");
    console.log(currentItem?.isQuizPage, "currentItem?.isQuizPage");
    console.log(cmi?.core, "cmi");

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
    if (!currentItem?.isQuizPage) {
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
    if (!currentItem?.isQuizPage) return false;

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
  ]);

  const progressPercent = ((currentItemIndex + 1) / manifestItems.length) * 100;

  return (
    <div className="flex-shrink-0 bg-slate-100 p-3 flex justify-between items-center shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)]">
      <button
        onClick={handlePrevious}
        disabled={currentItemIndex === 0}
        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-full shadow-sm hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RiArrowLeftSLine className="w-5 h-5" />
        <span className="hidden md:inline">Previous</span>
      </button>

      {/* <div className="flex-grow text-center px-4 flex flex-col justify-center w-1/3">
        <span className="text-sm font-semibold text-slate-800 truncate">
          {manifestItems[currentItemIndex]?.title}
        </span>
        <div className="mt-1.5">
          <div className="w-full bg-slate-300 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div> */}

      <div className="flex-grow text-center px-4 flex flex-col justify-center">
        {/* Info halaman */}
        <span className="text-sm truncate leading-tight">
          {manifestItems[currentItemIndex]?.title} ({currentItemIndex + 1} /{" "}
          {manifestItems.length})
        </span>

        {/* Skor hanya tampil di bawahnya jika kuis sudah dikerjakan */}
        {manifestItems[currentItemIndex]?.isQuizPage && (
          <div className="text-xs font-semibold text-green-600 leading-tight mt-1">
            <QuizScoreDisplay
              progress={currentProgress}
              scormVersion={scormVersion}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showRetryButton && (
          <button
            onClick={handleRetryQuiz}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full shadow-sm hover:bg-yellow-600 transition-colors"
          >
            <RiRestartLine className="w-5 h-5" />
            <span className="hidden md:inline">Retry Quiz</span>
          </button>
        )}

        {currentItemIndex < manifestItems.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden md:inline">Next</span>
            <RiArrowRightSLine className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => window.close()}
            disabled={isFinishDisabled}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiFlagLine className="w-5 h-5" />
            <span className="hidden md:inline">Finish</span>
          </button>
        )}
      </div>
    </div>
  );
}
