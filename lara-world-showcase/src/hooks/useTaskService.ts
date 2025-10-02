import { useState, useEffect } from 'react';
import { taskService, type Task, type Category, type CreateTaskData, type UpdateTaskData } from '@/services/taskService';

export const useTaskService = () => {
  const [tasks, setTasks] = useState<Task[]>(taskService.getTasks());
  const [categories, setCategories] = useState<Category[]>(taskService.getCategories());
  const [loading, setLoading] = useState(taskService.getLoading());
  const [error, setError] = useState<string | null>(taskService.getError());

  useEffect(() => {
    // Subscribe to service updates
    const unsubscribe = taskService.subscribe(() => {
      setTasks([...taskService.getTasks()]);
      setCategories([...taskService.getCategories()]);
      setLoading(taskService.getLoading());
      setError(taskService.getError());
    });

    // Initialize the service (this will only happen once)
    taskService.initialize();

    return unsubscribe;
  }, []);

  return {
    tasks,
    categories,
    loading,
    error,
    fetchTasks: (filters: Record<string, any> = {}) => taskService.fetchTasks(filters),
    fetchTask: (id: number) => taskService.fetchTask(id),
    createTask: (taskData: CreateTaskData) => taskService.createTask(taskData),
    updateTask: (id: number, taskData: UpdateTaskData) => taskService.updateTask(id, taskData),
    deleteTask: (id: number) => taskService.deleteTask(id),
    addComment: (taskId: number, content: string) => taskService.addComment(taskId, content),
    updateTaskStatus: (id: number, status: string) => taskService.updateTaskStatus(id, status),
    updateTaskPriority: (id: number, priority: string) => taskService.updateTaskPriority(id, priority),
  };
};
