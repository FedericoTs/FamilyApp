import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: "reminder" | "alert" | "info";
  category: "calendar" | "budget" | "family" | "system";
  read: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from Supabase
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Only update state if component is still mounted
        if (isMounted) {
          // Check if data is actually an array before setting state
          const notificationsArray = Array.isArray(data) ? data : [];
          setNotifications(notificationsArray);
          setUnreadCount(
            notificationsArray.filter((n: Notification) => !n.read).length || 0,
          );
        }
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    // Set up realtime subscription
    const subscription = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${user.id}`,
        },
        fetchNotifications,
      )
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

  // Create a new notification
  const createNotification = async (notification: {
    title: string;
    message: string;
    type: "reminder" | "alert" | "info";
    category: "calendar" | "budget" | "family" | "system";
  }) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          profile_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error("Error creating notification:", error);
      return { data: null, error: error.message };
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately for real-time feedback
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return { error: null };
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      return { error: error.message };
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("profile_id", user.id)
        .eq("read", false);

      if (error) throw error;

      // Update local state immediately for real-time feedback
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true })),
      );
      setUnreadCount(0);

      return { error: null };
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      return { error: error.message };
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately for real-time feedback
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
      setUnreadCount((prev) => {
        const deletedNotification = notifications.find((n) => n.id === id);
        return deletedNotification && !deletedNotification.read
          ? prev - 1
          : prev;
      });

      return { error: null };
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      return { error: error.message };
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("profile_id", user.id);

      if (error) throw error;

      // Update local state immediately for real-time feedback
      setNotifications([]);
      setUnreadCount(0);

      return { error: null };
    } catch (error: any) {
      console.error("Error deleting all notifications:", error);
      return { error: error.message };
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}
