import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;