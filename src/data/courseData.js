const SCORM_CONTENT_BASE_URL = "/scorm-proxy/scorm-content";

const data = [
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
    // ketika playerBehavior: "LMS_HANDLE_NAVIGATION", maka opsi dibawah ini sebaiknya ada
    quizPage: [4],
    quizAttempt: 0,
  },
  {
    id: "Furigana-exe-2004",
    title: "Furigana eXeLearning (SCORM 2004) + Quiz 1x Attempt",
    description:
      "Furigana Exelearning SCORM 2004 + Quiz 1x Attempt , kalau mau ulang reset data aja",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/furigana-exe-2004/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    // ketika playerBehavior: "LMS_HANDLE_NAVIGATION", maka opsi dibawah ini sebaiknya ada
    quizPage: [5],
    isQuizRepeatable: false,
    quizAttempt: 0,
  },
  {
    id: "daya-sample-1",
    title: "Daya Sample 1 (SCORM 1.2)",
    description: "Daya Sample 1 by eXeLearning , SCORM 1.2",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/daya-sample/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    // ketika playerBehavior: "LMS_HANDLE_NAVIGATION", maka opsi dibawah ini sebaiknya ada
    quizPage: [2],
  },
  {
    id: "daya-sample-2",
    title: "Daya Sample 2 (SCORM 1.2)",
    description: "Daya Sample 2 by eXeLearning , SCORM 1.2",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/daya-sample-2/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    // ketika playerBehavior: "LMS_HANDLE_NAVIGATION", maka opsi dibawah ini sebaiknya ada
    quizPage: false,
  },
  {
    id: "gakken-sample-questions",
    title: "Gakken Sample Question (SCORM 1.2)",
    description: "Gakken Sample Question, using eXeLearning , SCORM 1.2",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/gakken-sample-question/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    // ketika playerBehavior: "LMS_HANDLE_NAVIGATION", maka opsi dibawah ini sebaiknya ada
    quizPage: [3, 4, 5, 7, 8],
  },
  {
    id: "Demo_Gakken",
    title: "Demo Gakken (SCORM 1.2)",
    description: "Demo Gakken, using eXeLearning , SCORM 1.2",
    manifestUrl: `${SCORM_CONTENT_BASE_URL}/Demo_Gakken/imsmanifest.xml`,
    playerBehavior: "LMS_HANDLE_NAVIGATION",
    // ketika playerBehavior: "LMS_HANDLE_NAVIGATION", maka opsi dibawah ini sebaiknya ada
    quizPage: false,
  },
];

// dibalik
export const courses = [...data].reverse();
