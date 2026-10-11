import { useRef, FormEvent, useState } from "react";
import { Priority, Status } from "../types";
import Button from "./ui/Button";
import Card from "./ui/Card";

type TaskFormProps = {
  onSubmit: (task: {
    title: string;
    name: string;
    priority: Priority;
    description?: string;
    status?: Status;
    category?: string;
    dueDate?: string | null;
  }) => void;
};

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [titleError, setTitleError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!taskTitle.trim()) {
      setTitleError("Please enter task title");
      return;
    }

    setTitleError("");
    onSubmit({
      title: taskTitle.trim(),
      name: taskTitle.trim(),
      priority: priority || "medium",
      description: description.trim() || undefined,
      category: category.trim() || "General",
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      status: "TODO"
    });

    setTaskTitle("");
    setDescription("");
    setDueDate("");
    setShowMore(false);
    inputRef.current?.focus();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>✨</span> Add New Task
        </h2>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          {showMore ? "Less options ▲" : "More options (Details, Category, Due date) ▼"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          {/* Task Title field */}
          <div className="flex flex-col grow w-full">
            <input
              ref={inputRef}
              name="task-name"
              type="text"
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(event) => {
                setTaskTitle(event.target.value);
                if (titleError) setTitleError("");
              }}
              className="p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            />
            {titleError && (
              <p className="mt-1 text-xs text-red-500">{titleError}</p>
            )}
          </div>

          {/* Priority field */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              name="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              className="p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all grow sm:grow-0"
            >
              <option value="low">Low Priority 🟢</option>
              <option value="medium">Medium Priority 🟡</option>
              <option value="high">High Priority 🔴</option>
            </select>

            {/* Submit button */}
            <Button variant="primary" type="submit" className="px-5 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg">
              Add Task
            </Button>
          </div>
        </div>

        {/* Expandable Extra Details */}
        {showMore && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Task description, sub-notes, or key details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Category / Tag
              </label>
              <input
                type="text"
                placeholder="Work, Personal, Feature..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};
