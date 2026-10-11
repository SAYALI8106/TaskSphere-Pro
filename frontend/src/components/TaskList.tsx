import { TaskItem } from "./TaskItem";
import { Task } from "../types";

type TaskListProps = {
  tasks: Task[];
  onDelete: (taskId: number) => void;
  onToggleDone: (taskId: number) => void;
  updateTask: (task: Task) => void;
  onViewDetail?: (task: Task) => void;
};

export const TaskList = ({
  tasks,
  onDelete,
  onToggleDone,
  updateTask,
  onViewDetail
}: TaskListProps) => {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggleDone={onToggleDone}
          updateTask={updateTask}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
};
