import { useCallback, useEffect, useState } from "react";
import { Task, TaskStats } from "../types";
import {
  NewTaskData,
  taskApi,
  UpdateTaskData,
  GetTasksParams
} from "../services/taskApi";

const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Backend query state
  const [query, setQuery] = useState<GetTasksParams>({
    status: undefined // default = all or filtered by UI
  });

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await taskApi.getAllTasks(query);
      setTasks(response.data);
    } catch {
      setError("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await taskApi.getTaskStats();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  const addTask = useCallback(
    async (taskData: NewTaskData) => {
      const newTask = await taskApi.createTask(taskData);
      fetchTasks();
      fetchStats();
      return newTask;
    },
    [fetchTasks, fetchStats]
  );

  const updateTask = useCallback(
    async (id: number, updates: UpdateTaskData) => {
      const updatedTask = await taskApi.updateTask(id, updates);
      fetchTasks();
      fetchStats();
      return updatedTask;
    },
    [fetchTasks, fetchStats]
  );

  const deleteTask = useCallback(
    async (id: number) => {
      await taskApi.deleteTask(id);
      fetchTasks();
      fetchStats();
    },
    [fetchTasks, fetchStats]
  );

  const toggleTask = useCallback(
    async (id: number) => {
      await taskApi.toggleTask(id);
      fetchTasks();
      fetchStats();
    },
    [fetchTasks, fetchStats]
  );

  const setStatusFilter = (status: string) => {
    setQuery((q) => {
      if (status === "all") {
        const { status: _, done: __, ...rest } = q;
        return rest;
      }
      return { ...q, status };
    });
  };

  const setPriorityFilter = (priority: string) => {
    setQuery((q) => {
      if (priority === "all") {
        const { priority: _, ...rest } = q;
        return rest;
      }
      return { ...q, priority };
    });
  };

  const setCategoryFilter = (category: string) => {
    setQuery((q) => {
      if (category === "all") {
        const { category: _, ...rest } = q;
        return rest;
      }
      return { ...q, category };
    });
  };

  const setDueFilter = (dueFilter: string) => {
    setQuery((q) => {
      if (dueFilter === "all") {
        const { dueFilter: _, ...rest } = q;
        return rest;
      }
      return { ...q, dueFilter };
    });
  };

  const setSearch = (search: string) => {
    setQuery((q) => ({
      ...q,
      q: search.trim() || undefined
    }));
  };

  const setSort = (
    sortBy: GetTasksParams["sortBy"],
    order: GetTasksParams["order"]
  ) => {
    setQuery((q) => ({
      ...q,
      sortBy,
      order
    }));
  };

  const resetFilters = () => {
    setQuery({});
  };

  return {
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
    setFilter: setStatusFilter, // alias for legacy support
    refetch: fetchTasks
  };
};

export default useTasks;
