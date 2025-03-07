import { supabase } from "@/lib/supabase";
import { addDays, format, isBefore, isToday, isPast } from "date-fns";

// Function to create task reminder notifications
export const createTaskReminder = async (
  userId: string,
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  priority: string,
  assignedTo: string,
) => {
  try {
    // Create a reminder notification for the task
    const message = `Task "${taskTitle}" is due on ${format(dueDate, "EEEE, MMMM d")}. Assigned to: ${assignedTo}`;

    const { error } = await supabase.from("notifications").insert({
      profile_id: userId,
      title: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Task Reminder`,
      message,
      type: priority === "high" ? "alert" : "reminder",
      category: "family",
      read: false,
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating task reminder:", error);
    return { success: false, error: error.message };
  }
};

// Function to create overdue task notifications
export const createOverdueTaskNotification = async (
  userId: string,
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  assignedTo: string,
) => {
  try {
    // Create an overdue notification
    const message = `Task "${taskTitle}" assigned to ${assignedTo} is overdue! It was due on ${format(dueDate, "MMMM d")}.`;

    const { error } = await supabase.from("notifications").insert({
      profile_id: userId,
      title: "Overdue Task Alert",
      message,
      type: "alert",
      category: "family",
      read: false,
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating overdue notification:", error);
    return { success: false, error: error.message };
  }
};

// Function to check tasks and create notifications
export const checkTasksForNotifications = async (userId: string) => {
  try {
    // Get all incomplete tasks
    const { data: tasks, error } = await supabase
      .from("family_tasks")
      .select("*")
      .eq("profile_id", userId)
      .eq("completed", false);

    if (error) throw error;

    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Check for notifications that were already sent for these tasks
    // We'll query by task ID to ensure we don't create duplicates
    const { data: existingNotifications } = await supabase
      .from("notifications")
      .select("message, title")
      .eq("profile_id", userId)
      .eq("category", "family");

    const existingMessages = existingNotifications?.map((n) => n.message) || [];
    const existingTitles = existingNotifications?.map((n) => n.title) || [];

    // Process each task
    for (const task of tasks || []) {
      const dueDate = new Date(task.due_date);
      const taskTitle = `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority Task Reminder`;

      // Skip if we already have a notification for this task with the same title
      if (
        existingTitles.includes(taskTitle) &&
        existingMessages.some((msg) => msg.includes(task.title))
      ) {
        continue;
      }

      // For tasks due today, create reminders
      if (isToday(dueDate)) {
        await createTaskReminder(
          userId,
          task.id,
          task.title,
          dueDate,
          task.priority,
          task.assigned_to,
        );
      }
      // For tasks due tomorrow, create advance notice
      else if (
        isBefore(dueDate, addDays(tomorrow, 1)) &&
        !isBefore(dueDate, tomorrow)
      ) {
        await createTaskReminder(
          userId,
          task.id,
          task.title,
          dueDate,
          task.priority,
          task.assigned_to,
        );
      }
      // For overdue tasks, create alerts
      else if (isPast(dueDate) && !isToday(dueDate)) {
        // Skip if we already have an overdue notification for this task
        if (
          existingTitles.includes("Overdue Task Alert") &&
          existingMessages.some((msg) => msg.includes(task.title))
        ) {
          continue;
        }

        await createOverdueTaskNotification(
          userId,
          task.id,
          task.title,
          dueDate,
          task.assigned_to,
        );
      }
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error checking tasks for notifications:", error);
    return { success: false, error: error.message };
  }
};
