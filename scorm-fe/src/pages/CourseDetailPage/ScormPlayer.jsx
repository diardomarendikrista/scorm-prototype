import { useEffect, useState } from "react";
import { Scorm12API, Scorm2004API } from "scorm-again";

export default function ScormPlayer({
  scormUrl,
  manifestUrl,
  courseId = "aaa",
  userId = "user-1",
}) {
  const [isApiReady, setIsApiReady] = useState(false);

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
            window.close();
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
            window.close();
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
    <div className="w-full h-full">
      {isApiReady ? (
        <iframe
          src={scormUrl}
          className="w-full h-full border-0"
          title="SCORM Content Player"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-lg animate-pulse">Loading SCORM Player...</p>
        </div>
      )}
    </div>
  );
}
