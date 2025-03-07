import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FamilyMember } from "@/types/profile";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { checkTasksForNotifications } from "@/services/taskNotificationService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isBefore, isToday, isPast, parseISO } from "date-fns";
import {
  CheckSquare,
  Plus,
  CalendarIcon,
  Clock,
  Trash2,
  Edit,
  Filter,
  ArrowUpDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface FamilyTasksProps {
  familyMembers: FamilyMember[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  assignedTo: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  category: "household" | "school" | "shopping" | "personal" | "other";
}

interface DbTask {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  due_date: string;
  assigned_to: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  category: "household" | "school" | "shopping" | "personal" | "other";
  created_at: string;
  updated_at: string;
}

const FamilyTasks: React.FC<FamilyTasksProps> = ({ familyMembers = [] }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    dueDate: new Date(),
    priority: "medium",
    completed: false,
    category: "household",
    assignedTo: "",
  });
  const [filter, setFilter] = useState<{
    status: "all" | "completed" | "pending";
    assignee: string;
    category: string;
  }>({
    status: "all",
    assignee: "all",
    category: "all",
  });
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "assignee">(
    "dueDate",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch tasks from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("family_tasks")
          .select("*")
          .eq("profile_id", user.id);

        if (error) throw error;

        // Convert database tasks to the Task format used by the component
        const formattedTasks: Task[] = data.map((dbTask: DbTask) => ({
          id: dbTask.id,
          title: dbTask.title,
          description: dbTask.description || undefined,
          dueDate: parseISO(dbTask.due_date),
          assignedTo: dbTask.assigned_to,
          priority: dbTask.priority,
          completed: dbTask.completed,
          category: dbTask.category,
        }));

        setTasks(formattedTasks);

        // Check for tasks that need notifications
        await checkTasksForNotifications(user.id);
      } catch (err: any) {
        console.error("Error fetching tasks:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error loading tasks",
          description: "Failed to load your family tasks.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Set up realtime subscription
    const subscription = supabase
      .channel("family_tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_tasks",
          filter: `profile_id=eq.${user.id}`,
        },
        fetchTasks,
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

  const handleAddTask = async () => {
    if (!user || !newTask.title || !newTask.dueDate || !newTask.assignedTo)
      return;

    setIsSubmitting(true);

    try {
      const taskData = {
        profile_id: user.id,
        title: newTask.title,
        description: newTask.description || null,
        due_date: newTask.dueDate.toISOString(),
        assigned_to: newTask.assignedTo,
        priority: newTask.priority || "medium",
        completed: newTask.completed || false,
        category: newTask.category || "household",
      };

      if (newTask.id) {
        // Update existing task
        const { error } = await supabase
          .from("family_tasks")
          .update(taskData)
          .eq("id", newTask.id);

        if (error) throw error;

        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        // Add new task
        const { data, error } = await supabase
          .from("family_tasks")
          .insert(taskData)
          .select();

        if (error) throw error;

        // Check if the task is due soon and create a notification if needed
        if (data && data.length > 0) {
          const taskId = data[0].id;
          const dueDate = newTask.dueDate;
          const today = new Date();
          const tomorrow = addDays(today, 1);

          // If task is due today or tomorrow, create a notification
          if (
            isToday(dueDate) ||
            (isBefore(dueDate, addDays(tomorrow, 1)) &&
              !isBefore(dueDate, tomorrow))
          ) {
            // Import the specific function to avoid circular dependencies
            const { createTaskReminder } = await import(
              "@/services/taskNotificationService"
            );
            await createTaskReminder(
              user.id,
              taskId,
              newTask.title,
              dueDate,
              newTask.priority as string,
              newTask.assignedTo,
            );
          }
        }

        toast({
          title: "Task added",
          description: "Your new task has been added to the list.",
        });
      }

      // Reset form
      setNewTask({
        dueDate: new Date(),
        priority: "medium",
        completed: false,
        category: "household",
        assignedTo: "",
      });
      setIsAddTaskOpen(false);
    } catch (err: any) {
      console.error("Error saving task:", err);
      toast({
        variant: "destructive",
        title: "Error saving task",
        description: err.message || "Failed to save your task.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("family_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Task deleted",
        description: "The task has been removed from your list.",
      });
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: err.message || "Failed to delete the task.",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setNewTask(task);
    setIsAddTaskOpen(true);
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) return;

    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    try {
      const { error } = await supabase
        .from("family_tasks")
        .update({ completed: !taskToUpdate.completed })
        .eq("id", id);

      if (error) throw error;
    } catch (err: any) {
      console.error("Error updating task completion status:", err);
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: err.message || "Failed to update task status.",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "household":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "school":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shopping":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "personal":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (task: Task) => {
    if (task.completed) return "line-through text-gray-500";
    if (isPast(task.dueDate) && !isToday(task.dueDate))
      return "text-red-600 font-medium";
    if (isToday(task.dueDate)) return "text-amber-600 font-medium";
    return "";
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filter.status === "completed" && !task.completed) return false;
    if (filter.status === "pending" && task.completed) return false;

    // Filter by assignee
    if (filter.assignee !== "all" && task.assignedTo !== filter.assignee)
      return false;

    // Filter by category
    if (filter.category !== "all" && task.category !== filter.category)
      return false;

    return true;
  });

  // Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      return sortOrder === "asc"
        ? a.dueDate.getTime() - b.dueDate.getTime()
        : b.dueDate.getTime() - a.dueDate.getTime();
    } else if (sortBy === "priority") {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return sortOrder === "asc"
        ? priorityValues[a.priority] - priorityValues[b.priority]
        : priorityValues[b.priority] - priorityValues[a.priority];
    } else if (sortBy === "assignee") {
      return sortOrder === "asc"
        ? a.assignedTo.localeCompare(b.assignedTo)
        : b.assignedTo.localeCompare(a.assignedTo);
    }
    return 0;
  });

  // Get all unique assignees
  const allAssignees = ["Mom", "Dad", ...familyMembers.map((m) => m.name)];
  const uniqueAssignees = Array.from(new Set(allAssignees));

  // Toggle sort order and field
  const toggleSort = (field: "dueDate" | "priority" | "assignee") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-purple-700 flex items-center">
          <CheckSquare className="mr-2 h-6 w-6" />
          Family Tasks
        </h2>
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {newTask.id ? "Edit Task" : "Add New Task"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Enter task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newTask.description || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Add any additional details"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? (
                          format(newTask.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTask.dueDate}
                        onSelect={(date) =>
                          date && setNewTask({ ...newTask, dueDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, assignedTo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueAssignees.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, priority: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, category: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="household">Household</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newTask.id && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={newTask.completed}
                    onCheckedChange={(checked) =>
                      setNewTask({ ...newTask, completed: !!checked })
                    }
                  />
                  <label
                    htmlFor="completed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark as completed
                  </label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddTaskOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTask}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {newTask.id ? "Updating..." : "Adding..."}
                  </>
                ) : newTask.id ? (
                  "Update Task"
                ) : (
                  "Add Task"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2">Loading tasks...</span>
        </div>
      )}

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!loading && !error && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-medium">Task List</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filter.status}
                  onValueChange={(value) =>
                    setFilter({ ...filter, status: value as any })
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filter.assignee}
                  onValueChange={(value) =>
                    setFilter({ ...filter, assignee: value })
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {uniqueAssignees.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.category}
                  onValueChange={(value) =>
                    setFilter({ ...filter, category: value })
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="household">Household</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No tasks found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter.status !== "all" ||
                  filter.assignee !== "all" ||
                  filter.category !== "all"
                    ? "Try changing your filters or"
                    : "Get started by"}{" "}
                  adding a new task.
                </p>
                <Button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium w-10"></th>
                      <th className="text-left py-3 px-2 font-medium">
                        <button
                          className="flex items-center hover:text-purple-700"
                          onClick={() => toggleSort("dueDate")}
                        >
                          Due Date
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortBy === "dueDate" ? "text-purple-700" : "text-gray-400"}`}
                          />
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        <button
                          className="flex items-center hover:text-purple-700"
                          onClick={() => toggleSort("assignee")}
                        >
                          Assigned To
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortBy === "assignee" ? "text-purple-700" : "text-gray-400"}`}
                          />
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium">Task</th>
                      <th className="text-left py-3 px-2 font-medium">
                        <button
                          className="flex items-center hover:text-purple-700"
                          onClick={() => toggleSort("priority")}
                        >
                          Priority
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortBy === "priority" ? "text-purple-700" : "text-gray-400"}`}
                          />
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        Category
                      </th>
                      <th className="text-right py-3 px-2 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() =>
                              handleToggleComplete(task.id)
                            }
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div
                            className={`flex items-center ${getStatusColor(task)}`}
                          >
                            <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{format(task.dueDate, "MMM d")}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo}`}
                              />
                              <AvatarFallback>
                                {task.assignedTo.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className={getStatusColor(task)}>
                              {task.assignedTo}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className={getStatusColor(task)}>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={getCategoryColor(task.category)}>
                            {task.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-purple-600"
                              onClick={() => handleEditTask(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyTasks;
