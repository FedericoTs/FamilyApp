import { supabase } from "@/lib/supabase";
import { addDays, format, isBefore, isToday } from "date-fns";

// Function to create event reminders
export const createEventReminder = async (
  userId: string,
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  eventTime?: string,
  eventCategory?: string,
) => {
  try {
    // Create a reminder notification for the event
    const message = eventTime
      ? `Reminder: ${eventTitle} on ${format(eventDate, "EEEE, MMMM d")} at ${eventTime}`
      : `Reminder: ${eventTitle} on ${format(eventDate, "EEEE, MMMM d")}`;

    const { error } = await supabase.from("notifications").insert({
      profile_id: userId,
      title: "Event Reminder",
      message,
      type: "reminder",
      category: "calendar",
      read: false,
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating event reminder:", error);
    return { success: false, error: error.message };
  }
};

// Function to create appointment reminders
export const createAppointmentReminder = async (
  userId: string,
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  eventTime?: string,
  location?: string,
) => {
  try {
    // Create a more urgent reminder for appointments
    let message = `Appointment reminder: ${eventTitle} on ${format(eventDate, "EEEE, MMMM d")}`;
    if (eventTime) message += ` at ${eventTime}`;
    if (location) message += ` at ${location}`;

    const { error } = await supabase.from("notifications").insert({
      profile_id: userId,
      title: "Appointment Reminder",
      message,
      type: "alert", // Use alert type for appointments
      category: "calendar",
      read: false,
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating appointment reminder:", error);
    return { success: false, error: error.message };
  }
};

// Function to create deadline notifications
export const createDeadlineNotification = async (
  userId: string,
  eventId: string,
  eventTitle: string,
  eventDate: Date,
) => {
  try {
    // Create a deadline notification
    const message = `Deadline approaching: ${eventTitle} on ${format(eventDate, "EEEE, MMMM d")}`;

    const { error } = await supabase.from("notifications").insert({
      profile_id: userId,
      title: "Deadline Reminder",
      message,
      type: "alert",
      category: "calendar",
      read: false,
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating deadline notification:", error);
    return { success: false, error: error.message };
  }
};

// Function to check upcoming events and create notifications
export const checkUpcomingEvents = async (userId: string) => {
  try {
    // Get events in the next 7 days
    const today = new Date();
    const nextWeek = addDays(today, 7);

    const { data: events, error } = await supabase
      .from("family_events")
      .select("*")
      .eq("profile_id", userId)
      .gte("event_date", today.toISOString())
      .lte("event_date", nextWeek.toISOString());

    if (error) throw error;

    // Process each event
    for (const event of events || []) {
      const eventDate = new Date(event.event_date);

      // For events today, create immediate reminders
      if (isToday(eventDate)) {
        if (event.category === "appointment") {
          await createAppointmentReminder(
            userId,
            event.id,
            event.title,
            eventDate,
            event.event_time,
            event.location,
          );
        } else {
          await createEventReminder(
            userId,
            event.id,
            event.title,
            eventDate,
            event.event_time,
            event.category,
          );
        }
      }
      // For events tomorrow, create advance reminders
      else if (isBefore(eventDate, addDays(today, 2))) {
        if (event.category === "appointment") {
          await createAppointmentReminder(
            userId,
            event.id,
            event.title,
            eventDate,
            event.event_time,
            event.location,
          );
        } else {
          await createEventReminder(
            userId,
            event.id,
            event.title,
            eventDate,
            event.event_time,
            event.category,
          );
        }
      }
      // For events in 3 days, create early reminders
      else if (isBefore(eventDate, addDays(today, 4))) {
        await createEventReminder(
          userId,
          event.id,
          event.title,
          eventDate,
          event.event_time,
          event.category,
        );
      }
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error checking upcoming events:", error);
    return { success: false, error: error.message };
  }
};
