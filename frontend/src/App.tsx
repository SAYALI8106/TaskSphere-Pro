import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { Stats } from "./components/Stats";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { FilterTabs } from "./components/FilterTabs";
import { TaskDetailModal } from "./components/TaskDetailModal";

import { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Task, User } from "./types";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import useDarkMode from "./hooks/useDarkMode";
import useTasks from "./hooks/useTasks";
import ErrorMessage from "./components/ui/ErrorMessage";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";

const CONFETTI_DURATION_IN_SECONDS = 5;

const App = () => {
  const { isDark, toggle } = useDarkMode();
  const { user, loading: authLoading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center">
        <LoadingSpinner message="Initializing TaskSphere workspace..." />
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggleForm={() => setShowLogin(false)} />
    ) : (
      <Register onToggleForm={() => setShowLogin(true)} />
    );
  }

  return (
    <AuthenticatedApp
      user={user}
      logout={logout}
      isDark={isDark}
      toggle={toggle}
    />
  );
};

type AuthenticatedAppProps = {
  user: User;
  logout: () => void;
  isDark: boolean;
  toggle: () => void;
};

const AuthenticatedApp = ({
  user,
  logout,
  isDark,
  toggle
}: AuthenticatedAppProps) => {
  const {
    tasks,
    stats,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setDueFilter,
    setSearch,
    setSort,
    resetFilters,
    refetch
  } = useTasks();

  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimerRef = useRef<number | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<Task["id"] | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter States
  const [statusTab, setStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilterState] = useState("all");
  const [categoryFilterState, setCategoryFilterState] = useState("all");
  const [dueFilterState, setDueFilterState] = useState("all");
  const [sortByState, setSortByState] = useState<"createdAt" | "priority" | "dueDate" | "title">("createdAt");
  const [sortOrderState, setSortOrderState] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!showConfetti) return;

    if (confettiTimerRef.current) {
      clearTimeout(confettiTimerRef.current);
    }

    confettiTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
      confettiTimerRef.current = null;
    }, CONFETTI_DURATION_IN_SECONDS * 1000);

    return () => {
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
        confettiTimerRef.current = null;
      }
    };
  }, [showConfetti]);

  const handleSubmit = async (newPayload: {
    title: string;
    name: string;
    priority: Task["priority"];
    description?: string;
    status?: Task["status"];
    category?: string;
    dueDate?: string | null;
  }) => {
    await addTask(newPayload);
    toast.success("Task created successfully!");
  };

  const confirmDelete = async () => {
    if (!deleteTaskId) return;

    await deleteTask(deleteTaskId);
    toast.success("Task deleted successfully");
    setDeleteTaskId(null);
  };

  const onToggleDone = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);

    if (task && !task.done && task.status !== "COMPLETED" && !showConfetti) {
      setShowConfetti(true);
    }

    await toggleTask(taskId);
  };

  const handleResetFilters = () => {
    setStatusTab("all");
    setSearchQuery("");
    setPriorityFilterState("all");
    setCategoryFilterState("all");
    setDueFilterState("all");
    setSortByState("createdAt");
    setSortOrderState("desc");
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={250} />}
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Task Details Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={async (id, updates) => {
          await updateTask(id, updates);
          toast.success("Task updated successfully!");
          setSelectedTask(null);
        }}
        onDelete={(id) => setDeleteTaskId(id)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTaskId !== null}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
      >
        <Button variant="delete" onClick={confirmDelete}>
          Yes, Delete
        </Button>
        <Button
          variant="cancel"
          className="bg-gray-500 hover:bg-gray-600 text-white"
          onClick={() => setDeleteTaskId(null)}
        >
          Cancel
        </Button>
      </ConfirmDialog>

      {/* Header */}
      <header className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 dark:from-sky-900 dark:via-blue-900 dark:to-slate-900 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
              ⚡
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                TaskSphere <span className="text-xs px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/30 font-bold">PRO</span>
              </h1>
              <p className="text-xs text-sky-100/90 font-medium">
                Workspace &bull; <span className="font-bold text-white">{user.name}</span> 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs text-white border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold">{user.email}</span>
            </div>

            <Button
              variant="primary"
              onClick={toggle}
              className="rounded-full w-9 h-9 flex items-center justify-center text-base bg-white/10 hover:bg-white/20 border border-white/20 transition-transform active:scale-95"
              aria-label="Toggle theme"
            >
              {isDark ? "☀️" : "🌙"}
            </Button>

            <Button
              variant="primary"
              onClick={logout}
              className="px-4 py-1.5 text-xs font-bold bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-all shadow-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Stats */}
        <section>
          <Stats stats={stats} />
        </section>

        {/* Task Creator Form */}
        <TaskForm onSubmit={handleSubmit} />

        {/* Tasks Section with Filter Toolbar */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700/70">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                My Tasks
              </h2>
              {!loading && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                  {tasks.length}
                </span>
              )}
              <button
                type="button"
                onClick={refetch}
                title="Refresh tasks"
                className="p-1 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-sm rounded-lg"
              >
                🔄
              </button>
            </div>

            {/* Status Tab Filters */}
            <FilterTabs
              value={statusTab}
              onChange={(value) => {
                setStatusTab(value);
                setStatusFilter(value);
              }}
              tabs={[
                { label: "All Tasks", value: "all" },
                { label: "To Do", value: "TODO" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Completed", value: "COMPLETED" }
              ]}
            />
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 py-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm text-gray-400">🔍</span>
              <input
                type="text"
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Search title, notes..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setSearch(val);
                }}
              />
              {searchQuery && (
                <button
                  className="absolute right-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={() => {
                    setSearchQuery("");
                    setSearch("");
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Priority:
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilterState(e.target.value);
                  setPriorityFilter(e.target.value);
                }}
                className="w-full p-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority 🔴</option>
                <option value="medium">Medium Priority 🟡</option>
                <option value="low">Low Priority 🟢</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Category:
              </label>
              <select
                value={categoryFilterState}
                onChange={(e) => {
                  setCategoryFilterState(e.target.value);
                  setCategoryFilter(e.target.value);
                }}
                className="w-full p-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Due Date:
              </label>
              <select
                value={dueFilterState}
                onChange={(e) => {
                  setDueFilterState(e.target.value);
                  setDueFilter(e.target.value);
                }}
                className="w-full p-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Dates</option>
                <option value="overdue">⚠️ Overdue Tasks</option>
                <option value="dueToday">🔔 Due Today</option>
                <option value="upcoming">📅 Upcoming Tasks</option>
              </select>
            </div>

            {/* Sorting Control */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Sort:
              </label>
              <select
                value={`${sortByState}-${sortOrderState}`}
                onChange={(e) => {
                  const [by, ord] = e.target.value.split("-") as [any, any];
                  setSortByState(by);
                  setSortOrderState(ord);
                  setSort(by, ord);
                }}
                className="w-full p-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="priority-desc">Priority: High → Low</option>
                <option value="priority-asc">Priority: Low → High</option>
                <option value="dueDate-asc">Due Date: Earliest First</option>
                <option value="title-asc">Title: A → Z</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                title="Clear all filters"
                className="px-2 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 border border-gray-200 dark:border-gray-600 rounded-lg whitespace-nowrap transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Task Items List */}
          <div className="mt-2">
            {loading ? (
              <LoadingSpinner message="Fetching your tasks..." />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl my-4">
                <span className="text-4xl">📥</span>
                <h3 className="mt-3 text-base font-bold text-gray-800 dark:text-gray-200">
                  {searchQuery || priorityFilter !== "all" || dueFilterState !== "all" || statusTab !== "all"
                    ? "No tasks match your filter criteria"
                    : "No tasks found"}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {searchQuery || priorityFilter !== "all" || dueFilterState !== "all" || statusTab !== "all"
                    ? "Try adjusting your search keywords or resetting filters."
                    : "Get started by adding a new task above!"}
                </p>
                {(searchQuery || priorityFilter !== "all" || dueFilterState !== "all" || statusTab !== "all") && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-1.5 text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 rounded-lg hover:bg-sky-200"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onDelete={(id) => setDeleteTaskId(id)}
                onToggleDone={onToggleDone}
                onViewDetail={(task) => setSelectedTask(task)}
                updateTask={(task) =>
                  updateTask(task.id, {
                    title: task.title || task.name,
                    name: task.name || task.title,
                    priority: task.priority,
                    status: task.status,
                    description: task.description,
                    category: task.category,
                    dueDate: task.dueDate
                  })
                }
              />
            )}
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>TaskSphere Pro &copy; {new Date().getFullYear()} &bull; Enterprise Task &amp; Workflow Intelligence Platform</p>
      </footer>
    </div>
  );
};

export default App;
