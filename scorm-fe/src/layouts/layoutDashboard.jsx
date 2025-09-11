import Sidebar from "compoenents/Sidebar";

export default function LayoutDashboard({ children }) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
