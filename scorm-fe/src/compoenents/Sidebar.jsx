import { FaHome, FaList } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { id: "home", path: "/dashboard", label: "Home", icon: <FaHome /> },
    {
      id: "courses",
      path: "/dashboard/courses",
      label: "Course List",
      icon: <FaList />,
    },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex-shrink-0 p-4">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.link}>
              <Link
                to={item.path}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-blue-600"
                    : "hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
