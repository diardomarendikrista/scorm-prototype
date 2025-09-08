import React from "react";
import ScormPlayer from "./components/ScormPlayer";
import CourseSidebar from "./components/CourseSidebar";
import useScormManifest from "hooks/useScormManifest";

const manifestUrl = "/scorm-content/golf/imsmanifest.xml";

function App() {
  const courseData = useScormManifest(manifestUrl);

  console.log(courseData, "data");

  return (
    // Container utama dengan background cerah
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
      {/* Sidebar di Kiri */}
      {courseData ? (
        <CourseSidebar courseData={courseData} />
      ) : (
        <p>Loading course...</p>
      )}

      {/* Konten Utama (Player SCORM) di Kanan */}
      <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
        {/* Wrapper untuk SCORM player: dibuat responsif dengan aspect-ratio */}
        <div className="w-full h-full max-w-5xl max-h-[720px] bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <ScormPlayer />
        </div>
      </main>
    </div>
  );
}

export default App;
