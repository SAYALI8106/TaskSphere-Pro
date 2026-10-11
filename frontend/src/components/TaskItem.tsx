import { useState } from "react";
import { toast } from "react-toastify";

import { Task } from "../types";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

type TaskItemProps = {
  task: Task;
  onDelete: (taskId: number) => void;
  onToggleDone: (taskId: number) => void;
  updateTask: (task: Task) => void;
  onViewDetail?: (task: Task) => void;
};

export const TaskItem = ({
  task,
  onDelete,
  onToggleDone,
  updateTask,
  onViewDetail
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const saveEdit = (updatedTask: Task) => {
    updateTask(updatedTask);
    setIsEditing(false);
    toast.success("Task updated successfully!");
  };

  return (
    <div
      className={`
        w-full
        flex
        flex-col
        sm:flex-row
        gap-3
        items-start
        sm:items-center
        justify-between
        p-4
        border
        border-gray-200
        dark:border-gray-700/80
        bg-white
        dark:bg-gray-800
        rounded-xl
        mb-3
        shadow-xs
        hover:shadow-md
        transition-all
        ${task.done || task.status === "COMPLETED" ? "bg-gray-50/60 dark:bg-gray-800/40 opacity-75" : ""}
      `}
    >
      {isEditing ? (
        <EditTaskItem
          task={task}
          saveEdit={saveEdit}
          cancelEdit={() => setIsEditing(false)}
        />
      ) : (
        <ShowTaskItem
          task={task}
          onToggleDone={onToggleDone}
          startEdit={() => setIsEditing(true)}
          onDelete={onDelete}
          onViewDetail={onViewDetail}
        />
      )}
    </div>
  );
};

type ShowTaskItemProps = {
  task: Task;
  onToggleDone: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  startEdit: () => void;
  onViewDetail?: (task: Task) => void;
};

const ShowTaskItem = ({
  task,
  onToggleDone,
  startEdit,
  onDelete,
  onViewDetail
}: ShowTaskItemProps) => {
  const isCompleted = task.done || task.status === "COMPLETED";
  const title = task.title || task.name;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
    !isCompleted;

  const isDueToday =
    task.dueDate &&
    !isOverdue &&
    !isCompleted &&
    new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-2 break-words">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onViewDetail && onViewDetail(task)}
            className="text-left font-bold text-base text-gray-900 dark:text-gray-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            <span className={isCompleted ? "line-through text-gray-400 dark:text-gray-500" : ""}>
              {title}
            </span>
          </button>

          {/* Status badge */}
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
              isCompleted
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : task.status === "IN_PROGRESS"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
            }`}
          >
            {isCompleted ? "Done" : task.status === "IN_PROGRESS" ? "In Progress" : "To Do"}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Badge priority={task.priority} />

          {task.category && (
            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
              🏷️ {task.category}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`px-2 py-0.5 rounded-md font-medium ${
                isOverdue
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-bold"
                  : isDueToday
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              📅 {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              {isOverdue && " ⚠️ Overdue"}
              {isDueToday && " 🔔 Due Today"}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
        <Button
          variant="toggle"
          onClick={() => onToggleDone(task.id)}
          className={`text-xs px-3 py-1.5 font-semibold ${
            isCompleted
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {isCompleted ? "Reopen" : "Done ✓"}
        </Button>

        {onViewDetail && (
          <Button
            variant="cancel"
            onClick={() => onViewDetail(task)}
            className="text-xs px-3 py-1.5 font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 hover:bg-sky-200"
          >
            View
          </Button>
        )}

        <Button variant="edit" onClick={startEdit} disabled={isCompleted} className="text-xs px-3 py-1.5">
          Edit
        </Button>

        <Button variant="delete" onClick={() => onDelete(task.id)} className="text-xs px-3 py-1.5">
          Delete
        </Button>
      </div>
    </>
  );
};

type EditTaskItemProps = {
  task: Task;
  saveEdit: (task: Task) => void;
  cancelEdit: () => void;
};

const EditTaskItem = ({ task, saveEdit, cancelEdit }: EditTaskItemProps) => {
  const [title, setTitle] = useState(task.title || task.name);
  const [priority, setPriority] = useState<Task["priority"]>(
    task.priority || "medium"
  );

  const handleSave = () => {
    if (title.trim() === "") {
      toast.error("Task title cannot be empty");
      return;
    }

    saveEdit({
      ...task,
      title: title.trim(),
      name: title.trim(),
      priority
    });
  };

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-2 w-full">
        <input
          type="text"
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? handleSave() : null)}
        />

        <select
          className="w-fit p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="save" onClick={handleSave} className="text-xs px-3 py-1.5">
          Save
        </Button>

        <Button
          variant="cancel"
          onClick={cancelEdit}
          className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white"
        >
          Cancel
        </Button>
      </div>
    </>
  );
};
