function Navbar() {
  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          AI LMS
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-medium">
          Welcome, Shruti 👋
        </span>

        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="rounded-full"
        />
      </div>
    </nav>
  );
}

export default Navbar;