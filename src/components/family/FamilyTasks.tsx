import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FamilyMember } from "@/types/profile";
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
import { format, addDays, isBefore, isToday, isPast } from "date-fns";
import {
  CheckSquare,
  Plus,
  CalendarIcon,
  Clock,
  Trash2,
  Edit,
  Filter,
  ArrowUpDown,
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

const FamilyTasks: React.FC<FamilyTasksProps> = ({ familyMembers = [] }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Buy groceries for the week",
      description: "Milk, eggs, bread, fruits, and vegetables",
      dueDate: addDays(new Date(), 1),
      assignedTo: "Mom",
      priority: "high",
      completed: false,
      category: "shopping",
    },
    {
      id: "2",
      title: "Pick up dry cleaning",
      dueDate: new Date(),
      assignedTo: "Dad",
      priority: "medium",
      completed: false,
      category: "personal",
    },
    {
      id: "3",
      title: "Complete science project",
      description: "Solar system model due for science class",
      dueDate: addDays(new Date(), 3),
      assignedTo: "Emma",
      priority: "high",
      completed: false,
      category: "school",
    },
    {
      id: "4",
      title: "Clean the garage",
      dueDate: addDays(new Date(), 5),
      assignedTo: "Dad",
      priority: "low",
      completed: false,
      category: "household",
    },
    {
      id: "5",
      title: "Take out the trash",
      dueDate: addDays(new Date(), -1),
      assignedTo: "Jack",
      priority: "medium",
      completed: true,
      category: "household",
    },
  ]);

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

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate || !newTask.assignedTo) return;

    const task: Task = {
      id: newTask.id || Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      assignedTo: newTask.assignedTo,
      priority: (newTask.priority as "high" | "medium" | "low") || "medium",
      completed: newTask.completed || false,
      category:
        (newTask.category as
          | "household"
          | "school"
          | "shopping"
          | "personal"
          | "other") || "other",
    };

    if (newTask.id) {
      // Update existing task
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      // Add new task
      setTasks([...tasks, task]);
    }

    setNewTask({
      dueDate: new Date(),
      priority: "medium",
      completed: false,
      category: "household",
      assignedTo: "",
    });
    setIsAddTaskOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEditTask = (task: Task) => {
    setNewTask(task);
    setIsAddTaskOpen(true);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
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
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTask}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
              >
                {newTask.id ? "Update Task" : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                          onCheckedChange={() => handleToggleComplete(task.id)}
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
    </div>
  );
};

export default FamilyTasks;
