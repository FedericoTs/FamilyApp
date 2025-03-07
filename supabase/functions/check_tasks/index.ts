// This edge function runs daily to check for tasks and create notifications

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  format,
  addDays,
  isToday,
  isPast,
  isBefore,
} from "https://esm.sh/date-fns@2";

interface Task {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  due_date: string;
  assigned_to: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  category: string;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id");

    if (usersError) throw usersError;

    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Process each user's tasks
    const results = [];
    for (const user of users) {
      // Get incomplete tasks for this user
      const { data: tasks, error: tasksError } = await supabase
        .from("family_tasks")
        .select("*")
        .eq("profile_id", user.id)
        .eq("completed", false);

      if (tasksError) throw tasksError;

      // Check for notifications that were already sent today to avoid duplicates
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
      );
      const { data: existingNotifications } = await supabase
        .from("notifications")
        .select("message")
        .eq("profile_id", user.id)
        .gte("created_at", startOfDay.toISOString());

      const existingMessages =
        existingNotifications?.map((n) => n.message) || [];

      // Process each task
      for (const task of tasks || []) {
        const dueDate = new Date(task.due_date);

        // For tasks due today, create reminders
        if (isToday(dueDate)) {
          const message = `Task "${task.title}" is due today. Assigned to: ${task.assigned_to}`;

          // Skip if we already sent this notification today
          if (existingMessages.some((msg) => msg === message)) continue;

          await createNotification(supabase, {
            profile_id: user.id,
            title: `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority Task Reminder`,
            message,
            type: task.priority === "high" ? "alert" : "reminder",
            category: "family",
            read: false,
          });

          results.push({
            userId: user.id,
            taskId: task.id,
            taskTitle: task.title,
            notificationType: "due today",
          });
        }
        // For tasks due tomorrow, create advance notice
        else if (
          isBefore(dueDate, addDays(tomorrow, 1)) &&
          !isBefore(dueDate, tomorrow)
        ) {
          const message = `Task "${task.title}" is due tomorrow. Assigned to: ${task.assigned_to}`;

          // Skip if we already sent this notification today
          if (existingMessages.some((msg) => msg === message)) continue;

          await createNotification(supabase, {
            profile_id: user.id,
            title: "Upcoming Task Reminder",
            message,
            type: "reminder",
            category: "family",
            read: false,
          });

          results.push({
            userId: user.id,
            taskId: task.id,
            taskTitle: task.title,
            notificationType: "due tomorrow",
          });
        }
        // For overdue tasks, create alerts
        else if (isPast(dueDate) && !isToday(dueDate)) {
          const message = `Task "${task.title}" assigned to ${task.assigned_to} is overdue! It was due on ${format(dueDate, "MMMM d")}.`;

          // Skip if we already sent this notification today
          if (existingMessages.some((msg) => msg === message)) continue;

          await createNotification(supabase, {
            profile_id: user.id,
            title: "Overdue Task Alert",
            message,
            type: "alert",
            category: "family",
            read: false,
          });

          results.push({
            userId: user.id,
            taskId: task.id,
            taskTitle: task.title,
            notificationType: "overdue",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        notifications: results,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing tasks:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function createNotification(supabase, notification) {
  const { error } = await supabase.from("notifications").insert(notification);

  if (error) throw error;
  return true;
}
