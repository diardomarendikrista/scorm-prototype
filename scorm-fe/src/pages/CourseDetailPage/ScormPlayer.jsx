import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Scorm12API, Scorm2004API } from "scorm-again";

export default function ScormPlayer({
  manifestUrl,
  courseId,
  userId,
  playerBehavior = "NORMAL",
}) {
  const [manifestItems, setManifestItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [scormVersion, setScormVersion] = useState("1.2");

  const [currentProgress, setCurrentProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);

  const API = useRef(null);
  const storageKey = "scorm-prototype";

  // --- Helper Functions ---
  const getBaseUrl = (url) =>
    url ? url.substring(0, url.lastIndexOf("/") + 1) : "";
  const baseUrl = getBaseUrl(manifestUrl);
  const currentItemUrl =
    manifestItems.length > 0
      ? `${baseUrl}${manifestItems[currentItemIndex].href}`
      : "";

  const saveProgress = useCallback(() => {
    if (!API.current) return;

    // 1. Ambil data mentah terbaru dari API dan ubah menjadi objek JSON biasa
    // Ini menjadi "sumber kebenaran" kita untuk pembaruan kali ini.
    const newCmiData = JSON.parse(JSON.stringify(API.current.cmi));

    const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const progressIndex = allData.findIndex(
      (item) => item.courseId === courseId && item.userId === userId
    );
    const progress = progressIndex > -1 ? allData[progressIndex] : null;
    const existingCmi = progress ? progress.cmi : {};

    // 2. Gabungkan objek JSON lama dengan objek JSON baru. Semuanya konsisten.
    const mergedCmi = {
      ...existingCmi,
      ...newCmiData,
      core: { ...(existingCmi.core || {}), ...(newCmiData.core || {}) },
    };

    // 3. Hitung status keseluruhan menggunakan format data yang sudah konsisten
    let overallStatus = progress?.overallStatus || "incomplete";

    if (playerBehavior === "LMS_HANDLE_NAVIGATION") {
      const isLastSco = currentItemIndex === manifestItems.length - 1;

      // Sekarang kita membaca dari `newCmiData` yang sudah pasti formatnya
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
    };

    // 4. Simpan objek yang sudah konsisten ke localStorage dan state
    if (progressIndex > -1) {
      allData[progressIndex] = finalProgress;
    } else {
      allData.push(finalProgress);
    }
    localStorage.setItem(storageKey, JSON.stringify(allData));
    setCurrentProgress(finalProgress); // State `currentProgress` sekarang juga konsisten
  }, [
    courseId,
    userId,
    storageKey,
    playerBehavior,
    currentItemIndex,
    manifestItems.length,
    scormVersion,
  ]);

  const showRetryButton = useMemo(() => {
    // Tombol hanya relevan di mode LMS_HANDLE_NAVIGATION
    if (playerBehavior !== "LMS_HANDLE_NAVIGATION") return false;

    const currentItem = manifestItems[currentItemIndex];
    // Tampilkan hanya jika ini adalah halaman kuis
    if (!currentItem?.isQuizPage) return false;

    const cmi = currentProgress?.cmi || {};
    let isAttempted = false;

    if (scormVersion.includes("2004")) {
      // Untuk 2004, dianggap sudah dicoba jika statusnya bukan 'not attempted'
      isAttempted = cmi.completion_status !== "not attempted";
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

  // --- Navigasi ---
  const handlePrevious = useCallback(() => {
    if (currentItemIndex > 0) setCurrentItemIndex((prev) => prev - 1);
  }, [currentItemIndex]);

  const handleNext = useCallback(() => {
    if (currentItemIndex < manifestItems.length - 1)
      setCurrentItemIndex((prev) => prev + 1);
  }, [currentItemIndex, manifestItems.length]);

  const isNextDisabled = useMemo(() => {
    if (manifestItems.length === 0) {
      return currentItemIndex >= manifestItems.length - 1;
    }

    const currentItem = manifestItems[currentItemIndex];

    const cmi = currentProgress?.cmi || {};

    // cek apakah ini halaman quiz & sudah passed
    let isQuizAttempted = false;
    if (scormVersion.includes("2004")) {
      // Dianggap sudah dicoba jika status bukan 'not attempted'
      isQuizAttempted = cmi.completion_status !== "not attempted";
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
    courseId,
    userId,
    storageKey,
  ]);

  const handleRetryQuiz = useCallback(() => {
    setIsReloading(true);

    // refresh quiz
    setTimeout(() => {
      setIsReloading(false);
    }, 10);
  }, []);

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
        const items = Array.from(itemNodes).map((n) => {
          const title = n.querySelector("title")?.textContent || "Untitled";
          return {
            id: n.getAttribute("identifier"),
            title: title,
            href: resources[n.getAttribute("identifierref")],
            // FLAG untuk halaman quiz
            isQuizPage:
              title.toLowerCase().includes("quiz") ||
              title.toLowerCase().includes("kuis"),
          };
        });
        setManifestItems(items);

        const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const progress = allData.find(
          (item) => item.courseId === courseId && item.userId === userId
        );

        if (progress) {
          setCurrentProgress(progress);
        }
        setCurrentItemIndex(
          Math.min(
            progress?.lastScoIndex || 0,
            items.length > 0 ? items.length - 1 : 0
          )
        );
      } catch (err) {
        console.error("Gagal memuat manifest SCORM:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManifest();
  }, [manifestUrl, courseId, userId, storageKey]);

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
      <iframe
        src={isReloading ? "about:blank" : currentItemUrl} // handle untuk retake quiz
        key={currentItemUrl}
        className="flex-grow w-full border-0"
        title="SCORM Content Player"
      ></iframe>

      {playerBehavior === "LMS_HANDLE_NAVIGATION" &&
        manifestItems.length > 1 && (
          <div className="flex-shrink-0 bg-gray-100 p-2 flex justify-between items-center border-t">
            <button
              onClick={handlePrevious}
              disabled={currentItemIndex === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span>
              {manifestItems[currentItemIndex]?.title} ({currentItemIndex + 1} /{" "}
              {manifestItems.length})
            </span>
            <div className="flex gap-2">
              {showRetryButton && (
                <button
                  onClick={handleRetryQuiz}
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Reset Quiz
                </button>
              )}
              {currentItemIndex < manifestItems.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => window.close()}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
