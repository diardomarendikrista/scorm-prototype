import { useEffect, useState, useRef, useMemo } from "react";
import { Scorm12API, Scorm2004API } from "scorm-again";
import { useCustomAlert } from "hooks/useCustomAlert";
import { cn } from "lib/utils";
import NavigationBar from "./components/NavigationBar";
import QuizResultPage from "./components/QuizResultPage";
import { getBaseUrl } from "./lib/utils";
import useScormManifest from "./hooks/useScormManifest";
import { useScormProgress } from "./hooks/useScormProgress";
import { actionSaveProgress } from "./actions_bak";

export default function ScormPlayer({
  courseId,
  userId,
  manifestUrl,
  playerBehavior = "NORMAL", // NORMAL | LMS_HANDLE_NAVIGATION
  quizPage = false,
  isQuizRepeatable = true,
  quizAttempt = 0,
}) {
  const [currentProgress, setCurrentProgress] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isReloading, setIsReloading] = useState(false);

  const API = useRef(null);
  const iframeRef = useRef(null);
  const STORAGE_KEY = "scorm-prototype";
  const { CustomAlertModal } = useCustomAlert(iframeRef);

  // --- Hook untuk Mengambil & Mem-parsing Manifest ---
  const { manifestItems, scormVersion, loadingManifest } = useScormManifest({
    manifestUrl,
    quizPage,
  });

  // --- Hook untuk update progress
  useScormProgress({
    courseId,
    userId,
    STORAGE_KEY,
    setCurrentItemIndex,
    setCurrentProgress,
  });

  // --- Helper Functions ---
  const baseUrl = getBaseUrl(manifestUrl);
  const currentItemUrl =
    manifestItems.length > 0
      ? `${baseUrl}${manifestItems[currentItemIndex].href}`
      : "";

  const quizAttemptsExhausted = useMemo(() => {
    // Fitur ini hanya dipakai di mode LMS_HANDLE_NAVIGATION
    if (playerBehavior !== "LMS_HANDLE_NAVIGATION") return false;

    const currentItem = manifestItems[currentItemIndex];

    // Cek apakah ini halaman kuis
    if (!currentItem?.isQuizPage) return false;

    // Ambil jumlah percobaan yang sudah dilakukan
    const attemptsTaken = currentProgress?.quizAttempt || 0;

    // Cek apakah maxQuizAttempt lebih dari 0 dan isQuizRepeatable false
    return !isQuizRepeatable && attemptsTaken > 0;
  }, [
    currentProgress,
    currentItemIndex,
    manifestItems,
    playerBehavior,
    isQuizRepeatable,
  ]);

  const saveProgress = () => {
    actionSaveProgress({
      courseId,
      userId,
      API,
      STORAGE_KEY,
      playerBehavior,
      manifestItems,
      currentItemIndex,
      scormVersion,
      setCurrentProgress,
      currentProgress,
      isQuizRepeatable,
    });
  };

  // --- EFEK: Mengelola Sesi API untuk SETIAP SCO ---
  useEffect(() => {
    if (
      loadingManifest ||
      (playerBehavior === "LMS_HANDLE_NAVIGATION" &&
        manifestItems.length === 0) ||
      isReloading
    )
      return;

    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const progress = allData.find(
      (item) => item.courseId === courseId && item.userId === userId
    );
    const initialData = progress?.cmi || {};

    if (scormVersion.includes("2004")) {
      API.current = new Scorm2004API({ autocommit: true });
      window.API_1484_11 = API.current;
    } else {
      API.current = new Scorm12API({ autocommit: true });
      window.API = API.current;
    }

    if (initialData && Object.keys(initialData).length > 0) {
      API.current.loadFromFlattenedJSON(initialData);
    }

    const onCommit = () => {
      console.log("Commit triggered:", API.current.cmi);
      saveProgress();
    };
    const onTerminate = () => {
      // console.log("Terminate/Finish triggered:", API.current.cmi);
      saveProgress();
      if (playerBehavior === "NORMAL" || manifestItems.length <= 1) {
        window.close();
      }
    };

    API.current.on("Commit", onCommit);
    API.current.on("LMSCommit", onCommit);
    API.current.on("Terminate", onTerminate);
    API.current.on("LMSFinish", onTerminate);

    return () => {
      delete window.API;
      delete window.API_1484_11;
    };
  }, [
    currentItemIndex,
    manifestItems.length,
    scormVersion,
    courseId,
    userId,
    playerBehavior,
    isReloading,
  ]);

  if (loadingManifest) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading SCORM...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {CustomAlertModal}

      {quizAttemptsExhausted && (
        <QuizResultPage
          progress={currentProgress}
          scormVersion={scormVersion}
        />
      )}
      <iframe
        ref={iframeRef}
        src={isReloading ? "about:blank" : currentItemUrl} // handle untuk retake quiz
        key={`${currentItemUrl}-${isReloading}`} // handle untuk retake quiz
        className={cn("flex-grow w-full border-0", {
          hidden: quizAttemptsExhausted,
        })}
        title="SCORM Content Player"
      ></iframe>

      {playerBehavior === "LMS_HANDLE_NAVIGATION" &&
        manifestItems.length > 1 && (
          <NavigationBar
            courseId={courseId}
            userId={userId}
            manifestItems={manifestItems}
            currentItemIndex={currentItemIndex}
            setCurrentItemIndex={setCurrentItemIndex}
            currentProgress={currentProgress}
            setIsReloading={setIsReloading}
            playerBehavior={playerBehavior}
            scormVersion={scormVersion}
            quizAttempt={quizAttempt}
            isQuizRepeatable={isQuizRepeatable}
          />
        )}
    </div>
  );
}
