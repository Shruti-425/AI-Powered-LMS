import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ children, variant = "default" }) {
  const isDark = variant === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0B0C10]" : "bg-gray-100"}`}>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className={`flex-1 p-8 ${isDark ? "relative overflow-hidden" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;