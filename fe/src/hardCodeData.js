const cdnUrl = "https://scorm-content.diardo.my.id/";

export const courses = [
  {
    id: "golf",
    title: "Golf Basics (SCORM 1.2)",
    description: "Learn the fundamentals of playing golf.",
    scormUrl: cdnUrl + "golf/shared/launchpage.html",
    manifestUrl: cdnUrl + "golf/imsmanifest.xml",
  },
  {
    id: "golf-2004",
    title: "Golf Basics (SCORM 2004)",
    description: "Learn the fundamentals of playing golf.",
    scormUrl: cdnUrl + "golf-2004/shared/launchpage.html",
    manifestUrl: cdnUrl + "golf-2004/imsmanifest.xml",
  },
  {
    id: "iseazy",
    title: "Iseazy Course Example (SCORM 1.2)",
    description:
      "Course example with all the interactive elements that isEazy Author offers. Find inspiration for the creation of your course!",
    scormUrl: cdnUrl + "iseazy/index.html",
    manifestUrl: cdnUrl + "iseazy/imsmanifest.xml",
  },
];
