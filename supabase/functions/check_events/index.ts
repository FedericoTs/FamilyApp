// This edge function runs daily to check for upcoming events and create notifications

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Event {
  id: string;
  profile_id: string;
  title: string;
  event_date: string;
  event_time?: string;
  location?: string;
  description?: string;
  category: string;
  attendees: string[];
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
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Process each user's events
    const results = [];
    for (const user of users) {
      // Get upcoming events for this user
      const { data: events, error: eventsError } = await supabase
        .from("family_events")
        .select("*")
        .eq("profile_id", user.id)
        .gte("event_date", today.toISOString())
        .lte("event_date", nextWeek.toISOString());

      if (eventsError) throw eventsError;

      // Process each event
      for (const event of events) {
        const eventDate = new Date(event.event_date);
        const isToday = eventDate.toDateString() === today.toDateString();
        const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

        // Check if we already have a notification for this event
        const { data: existingNotifications } = await supabase
          .from("notifications")
          .select("id")
          .eq("profile_id", user.id)
          .ilike("message", `%${event.title}%`)
          .gte(
            "created_at",
            new Date(today.setHours(0, 0, 0, 0)).toISOString(),
          );

        // Skip if we already sent a notification today
        if (existingNotifications && existingNotifications.length > 0) {
          continue;
        }

        // Create appropriate notifications based on event timing and type
        if (isToday) {
          // Today's events get immediate reminders
          await createNotification(supabase, {
            profile_id: user.id,
            title: "Event Today",
            message: `Reminder: ${event.title} today${event.event_time ? ` at ${event.event_time}` : ""}${event.location ? ` at ${event.location}` : ""}`,
            type: event.category === "appointment" ? "alert" : "reminder",
            category: "calendar",
          });
        } else if (isTomorrow) {
          // Tomorrow's events get advance notice
          await createNotification(supabase, {
            profile_id: user.id,
            title: "Event Tomorrow",
            message: `Reminder: ${event.title} tomorrow${event.event_time ? ` at ${event.event_time}` : ""}${event.location ? ` at ${event.location}` : ""}`,
            type: event.category === "appointment" ? "alert" : "reminder",
            category: "calendar",
          });
        } else if (
          event.category === "appointment" ||
          event.category === "school"
        ) {
          // Appointments and school events get early reminders
          await createNotification(supabase, {
            profile_id: user.id,
            title: "Upcoming Event",
            message: `Upcoming: ${event.title} on ${formatDate(eventDate)}${event.event_time ? ` at ${event.event_time}` : ""}`,
            type: "info",
            category: "calendar",
          });
        }

        results.push({
          userId: user.id,
          eventId: event.id,
          eventTitle: event.title,
          notificationCreated: true,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing events:", error);
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

function formatDate(date) {
  const options = { weekday: "long", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
