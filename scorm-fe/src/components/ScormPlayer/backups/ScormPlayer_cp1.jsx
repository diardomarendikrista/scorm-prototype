import { useEffect, useState } from "react";
import { Scorm12API, Scorm2004API } from "scorm-again";

export default function ScormPlayer({
  manifestUrl,
  courseId = "aaa",
  userId = "user-1",
}) {
  const [isApiReady, setIsApiReady] = useState(false);

  const [manifestItems, setManifestItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      // Di dunia nyata, Anda mungkin ingin memastikan data SCO saat ini sudah di-commit
      // sebelum pindah. Library `scorm-again` dengan `autocommit: true` membantu di sini.
      setCurrentItemIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentItemIndex < manifestItems.length - 1) {
      setCurrentItemIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Dapatkan URL dasar dari manifestUrl untuk membangun path yang benar
  const getBaseUrl = (url) => {
    return url.substring(0, url.lastIndexOf("/") + 1);
  };
  const baseUrl = getBaseUrl(manifestUrl);
  const currentItemUrl =
    manifestItems.length > 0
      ? `${baseUrl}${manifestItems[currentItemIndex].href}`
      : "";

  useEffect(() => {
    let API;
    let scormVersion = "1.2";
    const storageKey = "scorm-prototype";

    const loadProgress = () => {
      const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const progress = allData.find(
        (item) => item.courseId === courseId && item.userId === userId
      );
      return progress ? progress.cmi : {};
    };

    const saveProgress = () => {
      const allData = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const existingIndex = allData.findIndex(
        (item) => item.courseId === courseId && item.userId === userId
      );

      if (existingIndex >= 0) {
        allData[existingIndex].cmi = API.cmi;
      } else {
        allData.push({
          courseId,
          userId,
          cmi: API.cmi,
        });
      }
      localStorage.setItem(storageKey, JSON.stringify(allData));
    };

    const initScormApi = async () => {
      try {
        const manifestRes = await fetch(manifestUrl);
        const manifestText = await manifestRes.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(manifestText, "text/xml");

        // 1. Dapatkan daftar item dari manifest
        const organization = xml.querySelector("organization");
        const itemNodes = organization.querySelectorAll("item");
        const resources = {};
        xml.querySelectorAll("resource").forEach((node) => {
          const id = node.getAttribute("identifier");
          const href = node.getAttribute("href");
          if (id && href) {
            resources[id] = href;
          }
        });

        const items = Array.from(itemNodes).map((node) => {
          const id = node.getAttribute("identifier");
          const idRef = node.getAttribute("identifierref");
          const title = node.querySelector("title").textContent;
          return {
            id,
            title,
            href: resources[idRef],
          };
        });

        setManifestItems(items);
        setCurrentItemIndex(0); // Mulai dari item pertama

        const versionNode = xml.querySelector("schemaversion");
        scormVersion = versionNode ? versionNode.textContent : "1.2";
        console.log("SCORM Version Detected:", scormVersion);

        const initialData = loadProgress();

        if (scormVersion.includes("2004") || scormVersion.includes("CAM 1.3")) {
          console.log("masuk ke SCORM 2004");

          API = new Scorm2004API({ autocommit: true, initialData });
          window.API_1484_11 = API;

          if (initialData) {
            API.loadFromFlattenedJSON(initialData);
          }

          API.on("Initialize", () => console.log("Initialize 2004"));
          API.on("Terminate", () => {
            console.log("Terminate 2004");
            saveProgress();

            if (items <= 1) {
              window.close();
            }
          });

          API.on("SetValue.cmi.*", (CMIElement, value) => {
            console.log("[2004] SetValue:", CMIElement, value);
          });

          API.on("Commit", () => {
            console.log("[2004] Commit:", API.cmi);
            saveProgress();
          });
        } else {
          console.log("masuk ke SCORM 1.2");

          API = new Scorm12API({ autocommit: true, initialData });
          window.API = API;

          if (initialData) {
            API.loadFromFlattenedJSON(initialData);
          }

          API.on("LMSInitialize", () => console.log("LMSInitialize 1.2"));
          API.on("LMSFinish", () => {
            console.log("LMSFinish 1.2");
            saveProgress();

            if (items <= 1) {
              window.close();
            }
          });

          API.on("LMSSetValue.cmi.*", (CMIElement, value) => {
            console.log("[1.2] SetValue:", CMIElement, value);
          });

          API.on("LMSCommit", () => {
            console.log("[1.2] Commit:", API.cmi);
            saveProgress();
          });
        }

        setIsApiReady(true);
      } catch (err) {
        console.error("Gagal inisialisasi SCORM:", err);
      }
    };

    initScormApi();

    return () => {
      delete window.API;
      delete window.API_1484_11;
      setIsApiReady(false);
    };
  }, [courseId, userId, manifestUrl]);

  return (
    <div className="w-full h-full flex flex-col">
      {isApiReady ? (
        <>
          <iframe
            src={currentItemUrl}
            key={currentItemUrl}
            // className-nya menjadi jauh lebih simpel!
            className="flex-grow w-full border-0"
            title="SCORM Content Player"
            allowFullScreen
          ></iframe>
          {/* Tampilkan navigasi jika ada lebih dari 1 item */}
          {manifestItems.length > 1 && (
            <div className="flex-shrink-0 bg-gray-100 p-2 flex justify-between items-center border-t">
              <button
                onClick={handlePrevious}
                disabled={currentItemIndex === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span>
                {manifestItems[currentItemIndex]?.title} ({currentItemIndex + 1}{" "}
                / {manifestItems.length})
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
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-lg animate-pulse">Loading SCORM Player...</p>
        </div>
      )}
    </div>
  );
}
