const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

router.get("/", courseController.getAllCourses);
router.post("/", upload.single("scormFile"), courseController.createCourse);
router.get("/:id", courseController.getCourseById);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
