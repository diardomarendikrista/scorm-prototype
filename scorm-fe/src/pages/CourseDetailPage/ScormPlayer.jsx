import { useEffect, useState, useRef, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

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
    if (!API.current) return; // Gunakan API.current
    const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
    let progress = allData.find(
      (item) => item.courseId === courseId && item.userId === userId
    );
    const existingCmi = progress ? progress.cmi : {};

    const mergedCmi = {
      ...existingCmi,
      ...API.current.cmi,
      core: { ...(existingCmi.core || {}), ...(API.current.cmi.core || {}) },
    };

    if (playerBehavior === "LMS_HANDLE_NAVIGATION") {
      const isLastSco = currentItemIndex === manifestItems.length - 1;
      if (scormVersion.includes("2004")) {
        let newStatus = API.current.cmi.completion_status;
        if (newStatus === "completed" && !isLastSco) newStatus = "incomplete";
        mergedCmi.completion_status = newStatus;
        if (API.current.cmi.success_status)
          mergedCmi.success_status = API.current.cmi.success_status;
      } else {
        let newStatus = API.current.cmi.core.lesson_status;
        if (newStatus === "completed" && !isLastSco) newStatus = "incomplete";
        mergedCmi.core.lesson_status = newStatus;
      }
    }

    const finalProgress = {
      courseId,
      userId,
      cmi: mergedCmi,
      lastScoIndex: currentItemIndex,
    };

    const progressIndex = allData.findIndex(
      (item) => item.courseId === courseId && item.userId === userId
    );
    if (progressIndex > -1) {
      allData[progressIndex] = finalProgress;
    } else {
      allData.push(finalProgress);
    }
    localStorage.setItem(storageKey, JSON.stringify(allData));
  }, [
    courseId,
    userId,
    storageKey,
    playerBehavior,
    currentItemIndex,
    manifestItems,
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
        const items = Array.from(itemNodes).map((n) => ({
          id: n.getAttribute("identifier"),
          title: n.querySelector("title")?.textContent || "Untitled",
          href: resources[n.getAttribute("identifierref")],
        }));
        setManifestItems(items);

        const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const progress = allData.find(
          (item) => item.courseId === courseId && item.userId === userId
        );
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
      (playerBehavior === "LMS_HANDLE_NAVIGATION" && manifestItems.length === 0)
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
      console.log("Commit triggered");
      saveProgress();
    };
    const onTerminate = () => {
      console.log("Terminate/Finish triggered");
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
        src={currentItemUrl}
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
            >
              Previous
            </button>
            <span>
              {manifestItems[currentItemIndex]?.title} ({currentItemIndex + 1} /{" "}
              {manifestItems.length})
            </span>
            <button
              onClick={handleNext}
              disabled={currentItemIndex >= manifestItems.length - 1}
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
