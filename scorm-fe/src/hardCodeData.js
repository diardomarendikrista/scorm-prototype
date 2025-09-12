const SCORM_CONTENT_BASE_URL = "/scorm-proxy/scorm-content";

export const courses = [
  {
    id: "golf",
    title: "Golf Basics (SCORM 1.2)",
    description: "Learn the fundamentals of playing golf.",
    scormUrl: `${SCORM_CONTENT_BASE_URL}/golf/shared/launchpage.html`,
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/golf/imsmanifest.xml`,
  },
  {
    id: "golf-2004",
    title: "Golf Basics (SCORM 2004)",
    description: "Learn the fundamentals of playing golf.",
    scormUrl: `${SCORM_CONTENT_BASE_URL}/golf-2004/shared/launchpage.html`,
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/golf-2004/imsmanifest.xml`,
  },
  {
    id: "iseazy",
    title: "Iseazy Course Example (SCORM 1.2)",
    description:
      "Course example with all the interactive elements that isEazy Author offers. Find inspiration for the creation of your course!",
    scormUrl: `${SCORM_CONTENT_BASE_URL}/iseazy/index.html`,
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/iseazy/imsmanifest.xml`,
  },
  {
    id: "iSpring",
    title: "iSpring (SCORM 1.2)",
    description: "iSpring Course",
    scormUrl: `${SCORM_CONTENT_BASE_URL}/iSpring/res/index.html`,
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/iSpring/imsmanifest.xml`,
  },
  {
    id: "Furigana-Example-Xerte",
    title: "Furigana Example (SCORM Xerte)",
    description: "Furigana Example Course by Xerte",
    scormUrl: `${SCORM_CONTENT_BASE_URL}/furigana-example-xerte/scorm2004RLO.htm`,
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-example-xerte/imsmanifest.xml`,
  },
  {
    id: "Furigana-Example-iSpring-PRO",
    title: "Furigana iSpring PRO (SCORM 1.2)",
    description: "Furigana Example Course by iSpring PRO",
    scormUrl: `${SCORM_CONTENT_BASE_URL}/furigana-ispring/res/index.html`,
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-ispring/imsmanifest.xml`,
  },
  {
    id: "Furigana-exe",
    title: "Furigana eXeLearning (SCORM 1.2)",
    description: "Furigana Exelearning",
    scormUrl: `${SCORM_CONTENT_BASE_URL}/furigana-exe/index.html`,
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-exe/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
  },
];
