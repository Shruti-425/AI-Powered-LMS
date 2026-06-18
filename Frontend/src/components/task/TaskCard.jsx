import {
  FiCalendar,
  FiTrash2,
  FiCheck,
  FiBookmark,
} from "react-icons/fi";

function TaskCard({ task, onToggleComplete, onDelete }) {
  const {
    task_id,
    title,
    description,
    due_date,
    priority,
    category,
    completed: rawCompleted,
  } = task;

  const completed = Boolean(rawCompleted);

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

  let borderGlowClass = "";
  let badgeColorClass = "";

  if (completed) {
    borderGlowClass =
      "border-slate-700 shadow-none bg-slate-900/40 opacity-60";

    badgeColorClass =
      "bg-slate-800 text-slate-400";
  } else {
    if (priority === "high") {
      borderGlowClass =
        "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)] bg-slate-900/80";

      badgeColorClass =
        "bg-pink-500/10 text-pink-400 border border-pink-500/20";
    } else if (priority === "medium") {
      borderGlowClass =
        "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-slate-900/80";

      badgeColorClass =
        "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    } else {
      borderGlowClass =
        "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-slate-900/80";

      badgeColorClass =
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  }

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${borderGlowClass}`}
    >
      <button
        onClick={() => onToggleComplete(task)}
        className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center border-2 ${
          completed
            ? "bg-slate-700 border-slate-700 text-slate-300"
            : "border-slate-500 text-transparent"
        }`}
      >
        {completed && <FiCheck />}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={`text-lg font-bold truncate ${
            completed
              ? "line-through text-slate-500"
              : "text-white"
          }`}
        >
          {title}
        </h3>

        {description && (
          <p
            className={`text-sm mt-1 ${
              completed
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-2.5 mt-4 text-xs font-semibold">
          <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
            <FiBookmark />
            {category}
          </span>

          <span
            className={`px-2.5 py-1 rounded-lg uppercase tracking-wider ${badgeColorClass}`}
          >
            {priority}
          </span>

          {due_date && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
              <FiCalendar />
              {formatDate(due_date)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task_id)}
        className="text-slate-500 hover:text-pink-500"
      >
        <FiTrash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export default TaskCard;