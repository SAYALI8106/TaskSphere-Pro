import { TaskStats } from "../types";

type StatsProps = {
  stats: TaskStats | null;
};

export const Stats = ({ stats }: StatsProps) => {
  if (!stats) return null;

  const items = [
    { label: "TOTAL", value: stats.total, color: "text-sky-500 dark:text-sky-400", icon: "📊" },
    { label: "COMPLETED", value: stats.completed ?? stats.done ?? 0, color: "text-emerald-500 dark:text-emerald-400", icon: "✅" },
    { label: "IN PROGRESS", value: stats.inProgress ?? 0, color: "text-amber-500 dark:text-amber-400", icon: "⏳" },
    { label: "HIGH PRIORITY", value: stats.highPriority ?? 0, color: "text-purple-500 dark:text-purple-400", icon: "🔥" },
    { label: "OVERDUE", value: stats.overdue ?? 0, color: "text-rose-500 dark:text-rose-400", icon: "⏰" }
  ];

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {items.map(({ label, value, color, icon }) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-800 flex flex-col justify-between items-center rounded-xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700/60 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
            <span>{icon}</span>
            <span>{label}</span>
          </div>
          <h2 className={`font-black text-2xl mt-1 ${color}`}>
            {value}
          </h2>
        </div>
      ))}
    </div>
  );
};
