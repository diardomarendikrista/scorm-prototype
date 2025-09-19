import { useEffect, useState } from "react";
import { Scorm12API, Scorm2004API } from "scorm-again";

export default function ScormPlayer({
  manifestUrl,
  courseId,
  userId,
  needsCustomNav = false,
}) {
  const [manifestItems, setManifestItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [scormVersion, setScormVersion] = useState("1.2");
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = "scorm-prototype";

  const getBaseUrl = (url) =>
    url ? url.substring(0, url.lastIndexOf("/") + 1) : "";
  const baseUrl = getBaseUrl(manifestUrl);
  const currentItemUrl =
    manifestItems.length > 0
      ? `${baseUrl}${manifestItems[currentItemIndex].href}`
      : "";

  // --- Navigasi ---
  const handlePrevious = () => {
    if (currentItemIndex > 0) setCurrentItemIndex((prev) => prev - 1);
  };
  const handleNext = () => {
    if (currentItemIndex < manifestItems.length - 1)
      setCurrentItemIndex((prev) => prev + 1);
  };

  // Helper Functions
  const loadProgress = () => {
    const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const progress = allData.find(
      (item) => item.courseId === courseId && item.userId === userId
    );
    return progress || { cmi: {}, lastScoIndex: currentItemIndex };
  };

  const saveProgress = () => {
    if (!API) return;
    const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
    let progress = allData.find(
      (item) => item.courseId === courseId && item.userId === userId
    );

    if (progress) {
      progress.cmi = {
        ...progress.cmi,
        ...API.cmi,
        core: { ...progress.cmi.core, ...API.cmi.core },
      };
      progress.lastScoIndex = currentItemIndex;
    } else {
      progress = {
        courseId,
        userId,
        cmi: API.cmi,
        lastScoIndex: currentItemIndex,
      };
      allData.push(progress);
    }
    localStorage.setItem(storageKey, JSON.stringify(allData));
  };

  // --- EFEK 1: Mengambil & Mem-parsing Manifest (Hanya berjalan sekali) ---
  useEffect(() => {
    if (!manifestUrl) return;
    setIsLoading(true);

    const fetchManifest = async () => {
      try {
        const res = await fetch(manifestUrl);
        const xmlText = await res.text();
        const xml = new DOMParser().parseFromString(xmlText, "text/xml");

        const versionNode = xml.querySelector("schemaversion");
        const detectedVersion = versionNode?.textContent || "1.2";
        setScormVersion(detectedVersion);

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

        // Resume
        const lastIndex = loadProgress().lastScoIndex;
        setCurrentItemIndex(Math.min(lastIndex, items.length - 1));
      } catch (err) {
        console.error("Gagal memuat manifest SCORM:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifest();
  }, [manifestUrl, courseId, userId]);

  // --- EFEK 2: Mengelola Sesi API untuk SETIAP SCO ---
  useEffect(() => {
    if (isLoading || manifestItems.length === 0) return;

    let API;

    const progressData = loadProgress();
    const initialData = progressData.cmi;

    // LOGIKA UTAMA: Kembali menggunakan if/else untuk menangani versi SCORM
    if (scormVersion.includes("2004") || scormVersion.includes("CAM 1.3")) {
      console.log(`SCO ${currentItemIndex}: Masuk ke SCORM 2004`);
      API = new Scorm2004API({ autocommit: true });
      window.API_1484_11 = API;

      if (initialData && Object.keys(initialData).length > 0) {
        API.loadFromFlattenedJSON(initialData);
      }

      API.on("Initialize", () =>
        console.log(`SCO ${currentItemIndex}: Initialize 2004`)
      );
      API.on("Terminate", () => {
        console.log(`SCO ${currentItemIndex}: Terminate 2004`);
        saveProgress();
        if (manifestItems.length <= 1) {
          window.close();
        } // Kompromi window.close
      });
      API.on("SetValue.cmi.*", (CMIElement, value) =>
        console.log("[2004] SetValue:", CMIElement, value)
      );
      API.on("Commit", () => {
        console.log("[2004] Commit");
        saveProgress();
      });
    } else {
      // SCORM 1.2
      console.log(`SCO ${currentItemIndex}: Masuk ke SCORM 1.2`);
      API = new Scorm12API({ autocommit: true });
      window.API = API;

      if (initialData && Object.keys(initialData).length > 0) {
        API.loadFromFlattenedJSON(initialData);
      }

      API.on("LMSInitialize", () =>
        console.log(`SCO ${currentItemIndex}: LMSInitialize 1.2`)
      );
      API.on("LMSFinish", () => {
        console.log(`SCO ${currentItemIndex}: LMSFinish 1.2`);
        saveProgress();
        if (manifestItems.length <= 1) {
          window.close();
        }
      });
      API.on("LMSSetValue.cmi.*", (CMIElement, value) =>
        console.log("[1.2] SetValue:", CMIElement, value)
      );
      API.on("LMSCommit", () => {
        console.log("[1.2] Commit");
        saveProgress();
      });
    }

    // Fungsi cleanup
    return () => {
      console.log(`Membersihkan API untuk SCO ${currentItemIndex}`);
      delete window.API;
      delete window.API_1484_11;
    };
  }, [
    currentItemIndex,
    isLoading,
    manifestItems,
    scormVersion,
    courseId,
    userId,
    storageKey,
  ]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading Manifest...</p>
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
      {needsCustomNav && manifestItems.length > 1 && (
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
          <button
            onClick={handleNext}
            disabled={currentItemIndex === manifestItems.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
