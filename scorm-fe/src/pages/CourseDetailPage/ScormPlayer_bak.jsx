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

    const initScormApi = async () => {
      try {
        const manifestRes = await fetch(manifestUrl);
        const manifestText = await manifestRes.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(manifestText, "text/xml");

        const versionNode = xml.querySelector("schemaversion");
        scormVersion = versionNode ? versionNode.textContent : "1.2";
        console.log("SCORM Version Detected:", scormVersion);

        const key = `scorm-progress-${courseId}-${userId}`;
        const initialData = JSON.parse(localStorage.getItem(key) || "{}");

        if (scormVersion.includes("2004") || scormVersion.includes("CAM 1.3")) {
          console.log("masuk ke 2004");

          API = new Scorm2004API({ autocommit: true, initialData });
          window.API_1484_11 = API;

          if (initialData) {
            API.loadFromFlattenedJSON(initialData);
          }

          API.on("Initialize", () => console.log("Initialize 2004"));
          API.on("Terminate", () => {
            console.log("Terminate 2004");
            localStorage.setItem(key, JSON.stringify(API.cmi));
            window.close();
          });

          API.on("SetValue.cmi.*", (CMIElement, value) => {
            console.log("[2004] SetValue:", CMIElement, value);
            console.log("[2004] data:", API.cmi);
          });
          API.on("Commit", () => {
            console.log("[2004] Commit:", API.cmi);
            localStorage.setItem(key, JSON.stringify(API.cmi));
          });
        } else {
          API = new Scorm12API({ autocommit: true, initialData });
          window.API = API;

          console.log("masuk ke 1.2");

          if (initialData) {
            API.loadFromFlattenedJSON(initialData);
          }

          API.on("LMSInitialize", () => console.log("LMSInitialize 1.2"));
          API.on("LMSFinish", () => {
            console.log("LMSFinish 1.2");
            localStorage.setItem(key, JSON.stringify(API.cmi));
            window.close();
          });

          API.on("LMSSetValue.cmi.*", (CMIElement, value) => {
            console.log("[1.2] SetValue:", CMIElement, value);
            console.log("[1.2] data:", API.cmi);
          });
          API.on("LMSCommit", () => {
            console.log("[1.2] Commit:", API.cmi);
            localStorage.setItem(key, JSON.stringify(API.cmi));
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
