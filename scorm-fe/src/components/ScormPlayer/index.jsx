import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Scorm12API, Scorm2004API } from "scorm-again";
import { useCustomAlert } from "hooks/useCustomAlert";
import NavigationBar from "./NavigationBar";

export default function ScormPlayer({
  manifestUrl,
  courseId,
  userId,
  playerBehavior = "NORMAL",
  quizPage = false,
  maxQuizAttempt = 0,
  quizAttempt = 0,
}) {
  const [manifestItems, setManifestItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [scormVersion, setScormVersion] = useState("1.2");
  const [currentProgress, setCurrentProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);

  const API = useRef(null);
  const iframeRef = useRef(null);
  const storageKey = "scorm-prototype";
  const { CustomAlertModal } = useCustomAlert(iframeRef);

  // --- Helper Functions ---
  const getBaseUrl = (url) =>
    url ? url.substring(0, url.lastIndexOf("/") + 1) : "";
  const baseUrl = getBaseUrl(manifestUrl);
  const currentItemUrl =
    manifestItems.length > 0
      ? `${baseUrl}${manifestItems[currentItemIndex].href}`
      : "";

  const hasScoreBeenSubmitted = (cmiData) => {
    // scorm2004
    if (scormVersion.includes("2004")) {
      return cmiData?.score?.raw !== "";
    } else {
      // SCORM 1.2
      // Dianggap sudah dicoba jika skor sudah terisi
      const scoreValue = cmiData.core?.score?.raw;
      return scoreValue !== undefined && scoreValue !== "";
    }
  };

  const saveProgress = useCallback(() => {
    if (!API.current) return;

    // Ambil data mentah terbaru dari API dan ubah menjadi objek JSON biasa
    const newCmiData = JSON.parse(JSON.stringify(API.current.cmi));

    const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
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
        const hasNewScore = hasScoreBeenSubmitted(newCmiData);
        const hadPreviousScore = hasScoreBeenSubmitted(currentProgress.cmi);
        if (hasNewScore && !hadPreviousScore) {
          currentAttempt = 1;
          console.log(`Quiz attempt incremented to: ${currentAttempt}`);
        }
      }

      // handle overAllStatus
      const isLastSco = currentItemIndex === manifestItems.length - 1;

      let newRawStatus;
      if (scormVersion.includes("2004")) {
        newRawStatus =
          newCmiData.completion_status || newCmiData.success_status;
      } else {
        // Karena `newCmiData` adalah hasil stringify, ia PASTI punya `_lesson_status` jika ada
        newRawStatus = newCmiData.core?._lesson_status;
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
      maxQuizAttempt: maxQuizAttempt,
      quizAttempt: currentAttempt,
    };

    // Simpan objek yang sudah konsisten ke localStorage dan state
    if (progressIndex > -1) {
      allData[progressIndex] = finalProgress;
    } else {
      allData.push(finalProgress);
    }
    localStorage.setItem(storageKey, JSON.stringify(allData));
    setCurrentProgress(finalProgress);
  }, [
    courseId,
    userId,
    storageKey,
    playerBehavior,
    currentItemIndex,
    manifestItems.length,
    scormVersion,
  ]);

  // --- EFEK 1: Mengambil & Mem-parsing Manifest ---
  useEffect(() => {
    if (!manifestUrl) return;
    const fetchManifest = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(manifestUrl);
        const xmlText = await res.text();
        const xml = new DOMParser().parseFromString(xmlText, "text/xml");

        const versionNode = xml.querySelector("schemaversion");
        setScormVersion(versionNode?.textContent || "1.2");

        const organization = xml.querySelector("organization");
        const itemNodes = organization?.querySelectorAll("item") || [];
        const resources = {};
        xml.querySelectorAll("resource[href]").forEach((r) => {
          resources[r.getAttribute("identifier")] = r.getAttribute("href");
        });
        const allItems = Array.from(itemNodes).map((n, index) => {
          const title = n.querySelector("title")?.textContent || "Untitled";
          return {
            id: n.getAttribute("identifier"),
            title: title,
            href: resources[n.getAttribute("identifierref")],
            isQuizPage: index === quizPage - 1,
          };
        });

        const launchableItems = allItems.filter((item) => item.href);
        setManifestItems(launchableItems);

        const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const progress = allData.find(
          (item) => item.courseId === courseId && item.userId === userId
        );

        if (progress) {
          setCurrentProgress(progress);
          setCurrentItemIndex(
            Math.min(
              progress.lastScoIndex || 0,
              launchableItems.length > 0 ? launchableItems.length - 1 : 0
            )
          );
        }
      } catch (err) {
        console.error("Gagal memuat manifest SCORM:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManifest();
  }, [manifestUrl, courseId, userId, storageKey, quizPage]);

  // --- EFEK 2: Mengelola Sesi API untuk SETIAP SCO ---
  useEffect(() => {
    if (
      isLoading ||
      (playerBehavior === "LMS_HANDLE_NAVIGATION" &&
        manifestItems.length === 0) ||
      isReloading
    )
      return;

    const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
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
      console.log("Terminate/Finish triggered:", API.current.cmi);
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
      console.log(`Membersihkan API untuk SCO ${currentItemIndex}`);
      delete window.API;
      delete window.API_1484_11;
    };
  }, [
    currentItemIndex,
    isLoading,
    manifestItems.length,
    scormVersion,
    courseId,
    userId,
    storageKey,
    saveProgress,
    playerBehavior,
    isReloading,
  ]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading SCORM...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {CustomAlertModal}

      <iframe
        ref={iframeRef}
        src={isReloading ? "about:blank" : currentItemUrl} // handle untuk retake quiz
        key={`${currentItemUrl}-${isReloading}`} // handle untuk retake quiz
        className="flex-grow w-full border-0"
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
            maxQuizAttempt={maxQuizAttempt}
          />
        )}
    </div>
  );
}
