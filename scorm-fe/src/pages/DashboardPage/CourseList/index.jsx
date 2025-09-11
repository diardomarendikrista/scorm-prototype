import { FaEdit, FaTrash } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { API } from "axiosInstance";
import LayoutDashboard from "layouts/layoutDashboard";
import { useNavigate } from "react-router-dom";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Handler functions for CRUD (to be implemented)
  const handleCreate = () => {
    navigate(`/dashboard/courses/new`);
  };

  const handleEdit = (course) => {
    alert(`Editing course: ${course.title} (to be implemented)`);
  };

  const handleDelete = (course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      alert(`Deleting course: ${course.title} (to be implemented)`);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Menggunakan instance Axios untuk request GET
        const response = await API.get("/api/courses");
        setCourses(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <LayoutDashboard>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + Create New Course
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {course.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {course.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-8 text-gray-500"
                >
                  No courses found. Click "Create New Course" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </LayoutDashboard>
  );
}
