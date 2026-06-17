import { FiSearch } from "react-icons/fi";

function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <FiSearch className="h-5 w-5 group-focus-within:text-cyan-400 transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search a task..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.25)] transition-all duration-300"
      />
    </div>
  );
}

export default SearchBar;
