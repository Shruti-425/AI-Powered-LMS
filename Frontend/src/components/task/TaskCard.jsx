import { FiCalendar, FiTrash2, FiCheck, FiBookmark } from "react-icons/fi";

function TaskCard({ task, onToggleComplete, onDelete }) {
  const { task_id, title, description, due_date, priority, category, completed } = task;

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine glow and border color based on priority and completion
  let borderGlowClass = "";
  let badgeColorClass = "";

  if (completed) {
    borderGlowClass = "border-slate-700 shadow-none bg-slate-900/40 opacity-60";
    badgeColorClass = "bg-slate-800 text-slate-400";
  } else {
    if (priority === "high") {
      borderGlowClass = "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)] bg-slate-900/80 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]";
      badgeColorClass = "bg-pink-500/10 text-pink-400 border border-pink-500/20";
    } else if (priority === "medium") {
      borderGlowClass = "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-slate-900/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]";
      badgeColorClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    } else {
      borderGlowClass = "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-slate-900/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]";
      badgeColorClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  }

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${borderGlowClass}`}
    >
      {/* Checkbox circle */}
      <button
        onClick={() => onToggleComplete(task)}
        className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
          completed
            ? "bg-slate-700 border-slate-700 text-slate-300"
            : "border-slate-500 hover:border-cyan-400 text-transparent"
        }`}
      >
        <FiCheck className="h-4 w-4 stroke-[3]" />
      </button>

      {/* Task Details */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-lg font-bold text-white transition-all duration-300 truncate ${
            completed ? "line-through text-slate-500" : ""
          }`}
        >
          {title}
        </h3>

        {description && (
          <p
            className={`text-sm mt-1 text-slate-400 leading-relaxed ${
              completed ? "text-slate-600" : ""
            }`}
          >
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-2.5 mt-4 text-xs font-semibold">
          {/* Category Badge */}
          <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
            <FiBookmark className="text-slate-400" />
            {category}
          </span>

          {/* Priority Badge */}
          <span className={`px-2.5 py-1 rounded-lg uppercase tracking-wider ${badgeColorClass}`}>
            {priority}
          </span>

          {/* Due Date Badge */}
          {due_date && (
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                completed
                  ? "bg-slate-800 text-slate-500"
                  : new Date(due_date) < new Date()
                  ? "bg-pink-500/10 text-pink-500 border border-pink-500/20 animate-pulse"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              <FiCalendar className="text-slate-400" />
              {formatDate(due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(task_id)}
        className="text-slate-500 hover:text-pink-500 p-2 rounded-xl hover:bg-slate-800/50 transition-all duration-300 cursor-pointer"
        title="Delete task"
      >
        <FiTrash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export default TaskCard;
