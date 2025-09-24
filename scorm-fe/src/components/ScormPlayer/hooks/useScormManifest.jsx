import { useEffect, useState } from "react";

export default function useScormManifest({ manifestUrl, quizPage }) {
  const [scormVersion, setScormVersion] = useState("1.2");
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [errorManifest, setErrorManifest] = useState(null);
  const [manifestItems, setManifestItems] = useState([]);

  useEffect(() => {
    if (!manifestUrl) return;
    setErrorManifest(null);

    const fetchManifest = async () => {
      setLoadingManifest(true);
      try {
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error("Failed to fetch manifest");
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
      } catch (err) {
        console.error("Gagal memuat manifest SCORM:", err);
        setErrorManifest(err);
      } finally {
        setLoadingManifest(false);
      }
    };
    fetchManifest();
  }, [manifestUrl, quizPage]);

  return {
    loadingManifest,
    errorManifest,
    manifestItems,
    scormVersion,
  };
}
