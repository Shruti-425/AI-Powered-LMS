import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchBar from "../../components/task/SearchBar";
import TaskForm from "../../components/task/TaskForm";
import TaskCard from "../../components/task/TaskCard";
import { FiCheckCircle, FiClock, FiActivity, FiFilter } from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000/api/tasks";
const DEFAULT_USER_ID = 5; // Matches the student user seeded in 09_tasks_schema.sql

const normalizeTask = (task) => ({
  ...task,
  completed: Boolean(task.completed),
});

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'completed'
  const [filterPriority, setFilterPriority] = useState("all"); // 'all' | 'low' | 'medium' | 'high'
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?userId=${DEFAULT_USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.map(normalizeTask));
        setBackendOnline(true);
        setErrorMsg("");
      } else {
        throw new Error("Failed to fetch from backend");
      }
    } catch (error) {
      console.warn("Backend API offline, falling back to localStorage", error);
      setBackendOnline(false);
      
      // LocalStorage Fallback
      const localTasks = localStorage.getItem(`tasks_user_${DEFAULT_USER_ID}`);
      if (localTasks) {
        setTasks(JSON.parse(localTasks).map(normalizeTask));
      } else {
        // Default seed tasks if no local storage
        const defaultTasks = [
          {
            task_id: 1,
            user_id: DEFAULT_USER_ID,
            title: "Review Database ER Diagram",
            description: "Review the database relationships and constraints for the upcoming LMS milestone.",
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "high",
            category: "Study",
            completed: false
          },
          {
            task_id: 2,
            user_id: DEFAULT_USER_ID,
            title: "Prepare Cloud Quiz",
            description: "Study AWS EC2 and S3 documentation for Cloud Computing quiz.",
            due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "medium",
            category: "Exam",
            completed: false
          },
          {
            task_id: 3,
            user_id: DEFAULT_USER_ID,
            title: "Complete React Tutorial",
            description: "Finish reading documentation for React Router and Context API.",
            due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            priority: "low",
            category: "Personal",
            completed: true
          }
        ];
        setTasks(defaultTasks);
        localStorage.setItem(`tasks_user_${DEFAULT_USER_ID}`, JSON.stringify(defaultTasks));
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync to localStorage when tasks change (only if backend is offline)
  useEffect(() => {
    if (!backendOnline && tasks.length > 0) {
      localStorage.setItem(`tasks_user_${DEFAULT_USER_ID}`, JSON.stringify(tasks));
    }
  }, [tasks, backendOnline]);

  // Add Task handler
  const handleAddTask = async (newTaskData) => {
    const fullTaskData = { ...newTaskData, user_id: DEFAULT_USER_ID };

    const addTaskLocally = () => {
      const localNewTask = normalizeTask({
        ...fullTaskData,
        task_id: Date.now(),
        completed: false,
        created_at: new Date().toISOString(),
      });
      setTasks((prev) => [localNewTask, ...prev]);
      setErrorMsg("");
    };

    if (backendOnline) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullTaskData),
        });
        if (response.ok) {
          const result = await response.json();
          setTasks((prev) => [normalizeTask(result.task), ...prev]);
          setErrorMsg("");
        } else {
          throw new Error("Failed to add task to backend");
        }
      } catch (error) {
        console.error("Error adding task:", error);
        setBackendOnline(false);
        setErrorMsg("Backend unavailable — task saved locally.");
        addTaskLocally();
      }
    } else {
      addTaskLocally();
    }
  };

  // Toggle complete handler
  const handleToggleComplete = async (task) => {
    const updatedStatus = !Boolean(task.completed);

    const toggleLocally = () => {
      setTasks((prev) =>
        prev.map((t) =>
          t.task_id === task.task_id ? { ...t, completed: updatedStatus } : t
        )
      );
      setErrorMsg("");
    };

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/${task.task_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: updatedStatus }),
        });
        if (response.ok) {
          const result = await response.json();
          setTasks((prev) =>
            prev.map((t) =>
              t.task_id === task.task_id ? normalizeTask(result.task) : t
            )
          );
          setErrorMsg("");
        } else {
          throw new Error("Failed to update status on backend");
        }
      } catch (error) {
        console.error("Error toggling task completion:", error);
        setBackendOnline(false);
        setErrorMsg("Backend unavailable — change saved locally.");
        toggleLocally();
      }
    } else {
      toggleLocally();
    }
  };

  // Delete Task handler
  const handleDeleteTask = async (taskId) => {
    const deleteLocally = () => {
      setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
      setErrorMsg("");
    };

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          deleteLocally();
        } else {
          throw new Error("Failed to delete task from backend");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        setBackendOnline(false);
        setErrorMsg("Backend unavailable — task removed locally.");
        deleteLocally();
      }
    } else {
      deleteLocally();
    }
  };

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search query filter
      const matchesSearch =
        !searchQuery.trim() ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const isCompleted = Boolean(task.completed);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "completed" && isCompleted) ||
        (filterStatus === "active" && !isCompleted);

      // Priority filter
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  // Compute stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => Boolean(t.completed)).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, rate };
  }, [tasks]);

  return (
    <DashboardLayout variant="dark">
      {/* Background Neon Glow Rings */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500">
              Task Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Organize your academic milestones and assignments in real time.
            </p>
          </div>

          {/* Connection Status indicator */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                backendOnline ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-amber-400"
              }`}
            ></span>
            <span className={backendOnline ? "text-emerald-400" : "text-amber-400"}>
              {backendOnline ? "API Online (MySQL Connected)" : "API Offline (Local Storage Cache)"}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl text-sm flex items-center gap-2 animate-bounce">
            <FiActivity /> {errorMsg}
          </div>
        )}

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls & Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md shadow-[0_0_30px_rgba(138,43,226,0.05)]">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <FiActivity className="text-fuchsia-500" /> Create Task
              </h2>
              <TaskForm onAddTask={handleAddTask} />
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiFilter className="text-cyan-400" /> Search & Filter
              </h2>
              <div className="space-y-4">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {["all", "low", "medium", "high"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilterPriority(p)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all cursor-pointer ${
                          filterPriority === p
                            ? "bg-slate-700 border-slate-500 text-white"
                            : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tasks List & Stats */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stats Panel */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <FiClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{stats.pending}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <FiCheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{stats.completed}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <FiActivity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Completion</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{stats.rate}%</p>
                </div>
              </div>
            </div>

            {/* List Header and Status Filter */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-xl font-bold text-white">
                  Active Tasks ({filteredTasks.length})
                </h2>

                <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700">
                  {["all", "active", "completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        filterStatus === status
                          ? "bg-slate-700 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-3">
                  <div className="animate-spin h-8 w-8 border-4 border-fuchsia-500 border-t-transparent rounded-full"></div>
                  <p className="text-sm font-semibold">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-slate-500 gap-4 text-center">
                  <FiCheckCircle className="h-12 w-12 text-slate-700" />
                  <div>
                    <p className="text-base font-bold text-slate-400">No tasks found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Try adding a new task, clearing your search query, or changing filters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.task_id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default TaskManager;
