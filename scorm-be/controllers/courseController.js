const prisma = require("../config/db");
const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const { XMLParser } = require("fast-xml-parser");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadDirToS3(directoryPath, s3FolderName) {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const s3Key = `${s3FolderName}/${file}`;
    if (fs.lstatSync(filePath).isDirectory()) {
      await uploadDirToS3(filePath, s3Key); // Rekursif untuk subdirektori
    } else {
      const fileStream = fs.createReadStream(filePath);
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: mime.lookup(filePath) || "application/octet-stream",
      };
      await s3Client.send(new PutObjectCommand(uploadParams));
    }
  }
}

class CourseController {
  /**
   * Mengambil semua kursus dari database
   * @route GET /api/courses
   */
  async getAllCourses(req, res) {
    try {
      const courses = await prisma.course.findMany({
        orderBy: {
          createdAt: "desc", // Tampilkan yang terbaru dulu
        },
      });
      res.status(200).json(courses);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching courses", error: error.message });
    }
  }

  /**
   * Membuat kursus baru
   * @route POST /api/courses
   */
  async createCourse(req, res) {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "SCORM file (.zip) is required." });
    }

    function slugify(text) {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
    }

    const tempExtractPath = path.join(
      __dirname,
      "..",
      "temp-extracted",
      file.filename.replace(".zip", "")
    );
    const zipFilePath = file.path;

    try {
      // Ekstrak file .zip
      await fs
        .createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: tempExtractPath }))
        .promise();

      // Baca imsmanifest.xml untuk menemukan entry point
      const manifestPath = path.join(tempExtractPath, "imsmanifest.xml");
      if (!fs.existsSync(manifestPath)) {
        throw new Error("imsmanifest.xml not found in the zip root.");
      }
      const manifestData = fs.readFileSync(manifestPath, "utf8");
      const parser = new XMLParser({ ignoreAttributes: false });
      const manifestJson = parser.parse(manifestData);

      const resource = manifestJson?.manifest?.resources?.resource;
      const scoResource = Array.isArray(resource)
        ? resource.find((r) => r["@_adlcp:scormtype"] === "sco")
        : resource;

      // kalau ga nemu imsmanifest.xml
      if (!scoResource || !scoResource["@_href"]) {
        throw new Error(
          "Could not find a valid SCO resource in imsmanifest.xml"
        );
      }
      const entryPoint = scoResource["@_href"];

      const courseSlug = slugify(title); // Bersihkan title untuk membuat slug
      const uniquePart = path.basename(tempExtractPath); // bagian unik dari nama file yang dibuat Multer
      const s3FolderName = `scorm-content/${courseSlug}-${uniquePart}`; // upload folder yang diekstrak ke S3
      await uploadDirToS3(tempExtractPath, s3FolderName);

      // URL untuk database
      const manifestUrl = `/scorm-proxy/${s3FolderName}/imsmanifest.xml`;
      const scormUrl = `/scorm-proxy/${s3FolderName}/${entryPoint}`;

      // Simpan metadata ke database
      const newCourse = await prisma.course.create({
        data: {
          title,
          description: description || "",
          scormUrl,
          manifestUrl,
        },
      });

      res.status(201).json(newCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      res
        .status(500)
        .json({ message: "Failed to create course.", error: error.message });
    } finally {
      // clear temp files
      fs.unlink(zipFilePath, (err) => {
        if (err) console.error("Error deleting temp zip file:", err);
      });
      fs.rm(tempExtractPath, { recursive: true, force: true }, (err) => {
        if (err) console.error("Error deleting temp extracted folder:", err);
      });
    }
  }

  /**
   * Mengambil satu kursus berdasarkan ID
   * @route GET /api/courses/:id
   */
  async getCourseById(req, res) {
    const { id } = req.params;
    try {
      const course = await prisma.course.findUnique({
        where: {
          id: id,
        },
      });

      // Jika kursus dengan ID tersebut tidak ditemukan, kirim 404
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }

      // Jika ditemukan, kirim datanya
      res.status(200).json(course);
    } catch (error) {
      console.error(`Error fetching course with id ${id}:`, error);
      res
        .status(500)
        .json({ message: "Error fetching course.", error: error.message });
    }
  }

  /**
   * Mengupdate kursus berdasarkan ID
   * @route PUT /api/courses/:id
   */
  async updateCourse(req, res) {
    const { id } = req.params;
    res
      .status(501)
      .json({ message: `Update course with ID: ${id} - Not Implemented Yet` });
  }

  /**
   * Menghapus kursus berdasarkan ID
   * @route DELETE /api/courses/:id
   */
  async deleteCourse(req, res) {
    const { id } = req.params;
    res
      .status(501)
      .json({ message: `Delete course with ID: ${id} - Not Implemented Yet` });
  }
}

module.exports = new CourseController();
