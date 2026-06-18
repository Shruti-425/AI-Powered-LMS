import { useState } from "react";
import { FiPlus, FiAlertCircle } from "react-icons/fi";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("Study");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    
    setError("");
    onAddTask({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      category,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setCategory("Study");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Task Title <span className="text-pink-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Complete DBMS Assignment"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(240,0,255,0.25)] transition-all duration-300"
        />
        {error && (
          <p className="mt-1.5 text-xs text-pink-500 flex items-center gap-1 animate-pulse">
            <FiAlertCircle /> {error}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Description
        </label>
        <textarea
          placeholder="Add details about the task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
          className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(240,0,255,0.25)] transition-all duration-300 resize-none"
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Due Date
          </label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(240,0,255,0.25)] transition-all duration-300 [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(240,0,255,0.25)] transition-all duration-300"
          >
            <option value="Study">Study</option>
            <option value="Exam">Exam</option>
            <option value="Project">Project</option>
            <option value="Personal">Personal</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Priority Level
        </label>
        <div className="flex gap-4">
          {["low", "medium", "high"].map((level) => {
            const isSelected = priority === level;
            let activeStyles = "";
            
            if (level === "low") {
              activeStyles = isSelected 
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]" 
                : "border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400";
            } else if (level === "medium") {
              activeStyles = isSelected 
                ? "bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]" 
                : "border-slate-700 hover:border-amber-500/50 hover:text-amber-400";
            } else {
              activeStyles = isSelected 
                ? "bg-pink-500/20 border-pink-400 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.3)]" 
                : "border-slate-700 hover:border-pink-500/50 hover:text-pink-400";
            }

            return (
              <button
                key={level}
                type="button"
                onClick={() => setPriority(level)}
                className={`flex-1 py-2 text-center border rounded-xl capitalize font-medium text-slate-400 transition-all duration-300 cursor-pointer ${activeStyles}`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] active:scale-[0.98] transition-all duration-300 cursor-pointer"
      >
        <FiPlus className="stroke-[3]" /> Add New Task
      </button>
    </form>
  );
}

export default TaskForm;
