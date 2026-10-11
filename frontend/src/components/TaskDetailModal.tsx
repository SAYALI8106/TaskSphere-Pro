import React, { useState, useEffect } from "react";
import { Task, Status, Priority } from "../types";
import Button from "./ui/Button";

type TaskDetailModalProps = {
  task: Task | null;
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: number) => void;
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("TODO");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || task.name || "");
      setDescription(task.description || "");
      setStatus(task.status || (task.done ? "COMPLETED" : "TODO"));
      setPriority(task.priority || "medium");
      setCategory(task.category || "General");
      if (task.dueDate) {
        // Format ISO date string to YYYY-MM-DD for date input
        setDueDate(new Date(task.dueDate).toISOString().split("T")[0]);
      } else {
        setDueDate("");
      }
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        name: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        category: category.trim() || "General",
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        done: status === "COMPLETED"
      });
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
    task.status !== "COMPLETED" &&
    !task.done;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📌</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? "Edit Task" : "Task Details"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, notes, or subtasks..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  >
                    <option value="low">Low 🟢</option>
                    <option value="medium">Medium 🟡</option>
                    <option value="high">High 🔴</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Work, Personal, Urgent..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
                  {task.title || task.name}
                </h2>
                {task.description ? (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {task.description}
                  </p>
                ) : (
                  <p className="mt-2 text-xs italic text-gray-400 dark:text-gray-500">
                    No description provided.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    task.status === "COMPLETED" || task.done
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : task.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                  }`}
                >
                  {task.status === "COMPLETED" || task.done
                    ? "✓ Completed"
                    : task.status === "IN_PROGRESS"
                    ? "⏳ In Progress"
                    : "📋 To Do"}
                </span>

                {/* Priority Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    (task.priority || "").toString().toLowerCase() === "high"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                      : (task.priority || "").toString().toLowerCase() === "medium"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  Priority: {(task.priority || "medium").toUpperCase()}
                </span>

                {/* Category Badge */}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  🏷️ {task.category || "General"}
                </span>
              </div>

              {/* Due Date Info */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50 text-xs space-y-1">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">📅 Due Date:</span>
                  <span className={isOverdue ? "text-red-600 dark:text-red-400 font-bold" : ""}>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : "No due date"}
                    {isOverdue && " ⚠️ (Overdue)"}
                  </span>
                </div>
                {task.createdAt && (
                  <div className="flex items-center justify-between text-gray-400 dark:text-gray-400 text-[11px]">
                    <span>Created:</span>
                    <span>{new Date(task.createdAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="delete"
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium"
                >
                  Delete Task
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="cancel"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200"
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="primary"
                    onClick={onClose}
                    className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
