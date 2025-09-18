import { useCallback, useMemo, useState } from "react";
import QuizScoreDisplay from "./QuizScoreDisplay";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiRestartLine,
  RiFlagLine,
} from "react-icons/ri";
import { cn } from "lib/utils";

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
  quizAttempt,
  maxQuizAttempt,
}) {
  const [isRetryDisabled, setIsRetryDisabled] = useState(false);
  const storageKey = "scorm-prototype";

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
    // Check if max attempts reached
    // const currentAttempts = currentProgress?.quizAttempt || 0;
    // if (maxQuizAttempt > 0 && currentAttempts >= maxQuizAttempt) {
    //   alert(`Maximum quiz attempts (${maxQuizAttempt}) reached!`);
    //   return;
    // }

    // // Disable button for 3 seconds
    // setIsRetryDisabled(true);

    // // Increment quiz attempt in localStorage
    // try {
    //   const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
    //   const progressIndex = allData.findIndex(
    //     (item) => item.courseId === courseId && item.userId === userId
    //   );

    //   if (progressIndex > -1) {
    //     // Increment the quiz attempt
    //     allData[progressIndex] = {
    //       ...allData[progressIndex],
    //       quizAttempt: (allData[progressIndex].quizAttempt || 0) + 1,
    //       isRetaking: true, // Flag to indicate this is a retake
    //     };

    //     console.log(allData[progressIndex], "allData[progressIndex]");

    //     localStorage.setItem(storageKey, JSON.stringify(allData));
    //     console.log(
    //       `Quiz attempt incremented to: ${allData[progressIndex].quizAttempt}`
    //     );
    //   }
    // } catch (error) {
    //   console.error("Failed to update quiz attempt:", error);
    // }

    // Trigger iframe reload
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
    }, 10);

    // Re-enable button after 3 seconds
    setTimeout(() => {
      setIsRetryDisabled(false);
    }, 3000);
  }, [courseId, userId, currentProgress, maxQuizAttempt, setIsReloading]);

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
    <div className="flex-shrink-0 bg-slate-100 p-3 flex justify-between items-center shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] relative">
      <div className="mt-1.5 w-full absolute bottom-0 left-0">
        <div className="w-full bg-slate-300 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={handlePrevious}
        disabled={currentItemIndex === 0}
        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-full shadow-sm hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RiArrowLeftSLine className="w-5 h-5" />
        <span className="hidden md:inline">Previous</span>
      </button>

      <div className="text-center flex flex-col justify-center absolute left-1/2 transform -translate-x-1/2">
        <span className="text-sm font-semibold text-slate-800 truncate">
          {manifestItems[currentItemIndex]?.title}{" "}
          {manifestItems[currentItemIndex]?.isQuizPage &&
            maxQuizAttempt !== 0 && (
              <span className="text-xs">
                - {currentProgress.quizAttempt || quizAttempt}/{maxQuizAttempt}{" "}
                Attemps
              </span>
            )}
          {/* {manifestItems[currentItemIndex]?.title} ({currentItemIndex + 1} /{" "}
          {manifestItems.length}) */}
        </span>
        {manifestItems[currentItemIndex]?.isQuizPage && (
          <div className="text-xs font-semibold text-green-600 leading-tight mt-1">
            <QuizScoreDisplay
              progress={currentProgress}
              scormVersion={scormVersion}
              quizAttemp={quizAttempt}
              maxQuizAttempt={maxQuizAttempt}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showRetryButton && (
          <button
            onClick={handleRetryQuiz}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full shadow-sm hover:bg-yellow-600 transition-colors",
              {
                "opacity-50 cursor-not-allowed hover:bg-yellow-500 !cursor-not-allowed":
                  isRetryDisabled,
              }
            )}
            disabled={isRetryDisabled}
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
