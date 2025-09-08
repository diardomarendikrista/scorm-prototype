import { useEffect, useState } from "react";

export default function useScormManifest(manifestUrl) {
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const loadManifest = async () => {
      try {
        const res = await fetch(manifestUrl);
        const xmlText = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        // ambil title course
        const orgTitle =
          xml.querySelector("organization > title")?.textContent ||
          "Untitled Course";

        // ambil semua modul (item)
        const items = [...xml.querySelectorAll("organization > item")].map(
          (item, idx) => {
            const title =
              item.querySelector("title")?.textContent || `Module ${idx + 1}`;
            const idRef = item.getAttribute("identifierref");
            const resourceHref = xml
              .querySelector(`resource[identifier="${idRef}"]`)
              ?.getAttribute("href");

            return {
              id: item.getAttribute("identifier"),
              title,
              href: resourceHref || "",
              status: "Not Started", // default, nanti bisa di-update dari SCORM runtime
            };
          }
        );

        setCourseData({
          title: orgTitle,
          // description: "Auto-generated from manifest",
          modules: items,
        });
      } catch (err) {
        console.error("Gagal parsing manifest:", err);
      }
    };

    loadManifest();
  }, [manifestUrl]);

  return courseData;
}
