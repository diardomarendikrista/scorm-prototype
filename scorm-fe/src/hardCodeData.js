const SCORM_CONTENT_BASE_URL = "/scorm-proxy/scorm-content";

export const courses = [
  {
    id: "golf",
    title: "Golf Basics (SCORM 1.2)",
    description: "Learn the fundamentals of playing golf.",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/golf/imsmanifest.xml`,
  },
  {
    id: "golf-2004",
    title: "Golf Basics (SCORM 2004)",
    description: "Learn the fundamentals of playing golf.",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/golf-2004/imsmanifest.xml`,
  },
  {
    id: "iseazy",
    title: "Iseazy Course Example (SCORM 1.2)",
    description:
      "Course example with all the interactive elements that isEazy Author offers. Find inspiration for the creation of your course!",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/iseazy/imsmanifest.xml`,
  },
  {
    id: "iSpring",
    title: "iSpring (SCORM 1.2)",
    description: "iSpring Course",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/iSpring/imsmanifest.xml`,
  },
  {
    id: "Furigana-Example-Xerte",
    title: "Furigana Example (SCORM Xerte)",
    description: "Furigana Example Course by Xerte",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-example-xerte/imsmanifest.xml`,
  },
  {
    id: "Furigana-Example-iSpring-PRO",
    title: "Furigana iSpring PRO (SCORM 1.2)",
    description: "Furigana Example Course by iSpring PRO",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-ispring/imsmanifest.xml`,
  },
  {
    id: "Furigana-exe",
    title: "Furigana eXeLearning (SCORM 1.2)",
    description: "Furigana Exelearning",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-exe/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    quizPage: 4,
  },
  {
    id: "Furigana-exe-2004",
    title: "Furigana eXeLearning (SCORM 2004)",
    description: "Furigana Exelearning SCORM 2004",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-exe-2004/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    quizPage: 4,
  },
  {
    id: "daya-sample-1",
    title: "Daya Sample 1 (SCORM 1.2)",
    description: "Daya Sample 1 by eXeLearning , SCORM 1.2",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/daya-sample/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    quizPage: 2,
  },
  {
    id: "daya-sample-2",
    title: "Daya Sample 2 (SCORM 1.2)",
    description: "Daya Sample 2 by eXeLearning , SCORM 1.2",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/daya-sample-2/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    quizPage: false,
  },
];
