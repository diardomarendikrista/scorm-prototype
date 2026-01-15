import { useEffect, useState, useRef, useMemo } from "react";
import { Scorm12API, Scorm2004API } from "scorm-again";
// import { useCustomAlert } from "hooks/useCustomAlert";
import NavigationBar from "./components/NavigationBar";
import QuizResultPage from "./components/QuizResultPage";
import { getBaseUrl } from "./lib/utils";
import useScormManifest from "./hooks/useScormManifest";
import { useScormProgress } from "./hooks/useScormProgress";
import { actionSaveProgress } from "./actions";
import "./index.css";

/**
 * SCORM Player utama untuk menjalankan course SCORM 1.2 / 2004
 *
 * @param {string} props.courseId - ID course (dari URL)
 * @param {string} [props.userId] - ID user (optional), kalau tidak ada, hapus saja
 * @param {string} props.manifestUrl - URL imsmanifest.xml
 * @param {"NORMAL"|"LMS_HANDLE_NAVIGATION"} [props.playerBehavior="NORMAL"]
 *        NORMAL: player mengatur navigasi sendiri
 *        LMS_HANDLE_NAVIGATION: LMS menangani next/prev
 * @param {number[]} [props.quizPage=false] - Index halaman yang merupakan quiz
 * @param {boolean} [props.isQuizRepeatable=true] - Apakah quiz bisa diulang
 */
export default function ScormPlayer({
  courseId,
  userId,
  manifestUrl,
  playerBehavior = "NORMAL",
  quizPage = false,
  isQuizRepeatable = true,
}) {
  const [currentProgress, setCurrentProgress] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isReloading, setIsReloading] = useState(false);

  const progressCacheRef = useRef(null);
  const API = useRef(null);
  const iframeRef = useRef(null);
  const STORAGE_KEY = "scorm-prototype";
  // const { CustomAlertModal } = useCustomAlert(iframeRef);

  // --- Hook to Fetch & Parse Manifest ---
  const { manifestItems, scormVersion, loadingManifest, isMultiPageQuiz } =
    useScormManifest({
      manifestUrl,
      quizPage,
    });

  // --- Hook to update progress ---
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
    if (playerBehavior !== "LMS_HANDLE_NAVIGATION") return false;

    const currentItem = manifestItems[currentItemIndex];
    if (!currentItem?.isQuizPage) return false;

    const attemptsTaken = currentProgress?.quizAttempt || 0;
    return !isQuizRepeatable && attemptsTaken > 0;
  }, [
    currentProgress,
    currentItemIndex,
    manifestItems,
    playerBehavior,
    isQuizRepeatable,
  ]);

  console.log(manifestItems[currentItemIndex], "currentItem");

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
      progressCacheRef,
      currentProgress,
      isQuizRepeatable,
    });
  };

  // --- EFFECT: Manage API Session for EACH SCO ---
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
      <div className="scorm-player-loading">
        <p>Loading SCORM...</p>
      </div>
    );
  }

  return (
    <div className="scorm-player-container">
      {/* {CustomAlertModal} */}

      {quizAttemptsExhausted && (
        <QuizResultPage
          progress={currentProgress}
          scormVersion={scormVersion}
        />
      )}

      <iframe
        ref={iframeRef}
        src={isReloading ? "about:blank" : currentItemUrl}
        key={`${currentItemUrl}-${isReloading}`}
        className={`scorm-player-iframe ${quizAttemptsExhausted ? "hidden" : ""}`}
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
            isQuizRepeatable={isQuizRepeatable}
            isMultiPageQuiz={isMultiPageQuiz}
          />
        )}
    </div>
  );
}
