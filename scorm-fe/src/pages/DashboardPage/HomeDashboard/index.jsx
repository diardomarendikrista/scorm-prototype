import LayoutDashboard from "layouts/layoutDashboard";

export default function HomeDashboard() {
  return (
    <LayoutDashboard>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to the Dashboard
        </h1>
        <p className="mt-4 text-gray-600">
          Select an option from the menu on the left to manage your content.
        </p>
      </div>
    </LayoutDashboard>
  );
}
