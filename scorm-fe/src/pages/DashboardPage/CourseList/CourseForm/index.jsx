import { API } from "axiosInstance";
import LayoutDashboard from "layouts/layoutDashboard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("SCORM file (.zip) is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Kita menggunakan FormData karena kita mengirim file
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("scormFile", form.file);

    console.log(formData);

    try {
      // Endpoint POST untuk membuat kursus baru (akan kita buat di backend)
      await API.post("/api/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Jika berhasil, kembali ke halaman daftar kursus
      navigate("/dashboard/courses");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while creating the course."
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutDashboard>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Create New Course
        </h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Course Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="file"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              SCORM Package (.zip file)
            </label>
            <input
              id="file"
              type="file"
              accept=".zip"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              ZIP file containing the SCORM content.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
            >
              {isSubmitting ? "Creating..." : "Create Course"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/courses")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </LayoutDashboard>
  );
}
