import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import {
  Bell,
  Calendar,
  DollarSign,
  Users,
  Check,
  X,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface NotificationSettings {
  enableNotifications: boolean;
  calendarReminders: boolean;
  budgetAlerts: boolean;
  familyUpdates: boolean;
  systemNotifications: boolean;
}

const FamilyNotifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [settings, setSettings] = useState<NotificationSettings>({
    enableNotifications: true,
    calendarReminders: true,
    budgetAlerts: true,
    familyUpdates: true,
    systemNotifications: true,
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "calendar" | "budget" | "family" | "system"
  >("all");

  // Load notification settings from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("profile_settings")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Map database settings to our local settings format
          setSettings({
            enableNotifications: data.notification_enabled ?? true,
            calendarReminders: true,
            budgetAlerts: true,
            familyUpdates: true,
            systemNotifications: true,
          });
        }
      } catch (err) {
        console.error("Error loading notification settings:", err);
        // Use default settings if we can't load from database
      }
    };

    fetchSettings();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const result = await markAsRead(id);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to mark notification as read: ${result.error}`,
        });
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to mark all notifications as read: ${result.error}`,
        });
      } else {
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to mark all notifications as read. Please try again.",
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const result = await deleteNotification(id);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete notification: ${result.error}`,
        });
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification. Please try again.",
      });
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      try {
        const result = await deleteAllNotifications();
        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to clear all notifications: ${result.error}`,
          });
        } else {
          toast({
            title: "Success",
            description: "All notifications have been cleared",
          });
        }
      } catch (err) {
        console.error("Error clearing all notifications:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to clear all notifications. Please try again.",
        });
      }
    }
  };

  // Save notification settings to Supabase
  const saveNotificationSettings = async () => {
    if (!user) return;

    setSavingSettings(true);
    setSettingsError(null);

    try {
      const { error } = await supabase
        .from("profile_settings")
        .update({
          notification_enabled: settings.enableNotifications,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (err: any) {
      console.error("Error saving notification settings:", err);
      setSettingsError(err.message);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "Failed to save your notification preferences.",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleSetting = (setting: keyof NotificationSettings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "alert":
        return "bg-red-100 text-red-800 border-red-200";
      case "info":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "calendar":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "budget":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "family":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter notifications based on read status, category, and settings preferences
  const filteredNotifications = notifications.filter((notification) => {
    // First apply settings filters
    if (!settings.enableNotifications) return false;

    // Filter by notification category based on settings
    if (notification.category === "calendar" && !settings.calendarReminders)
      return false;
    if (notification.category === "budget" && !settings.budgetAlerts)
      return false;
    if (notification.category === "family" && !settings.familyUpdates)
      return false;
    if (notification.category === "system" && !settings.systemNotifications)
      return false;

    // Then apply UI filters
    if (
      filter !== "all" &&
      (filter === "read" ? !notification.read : notification.read)
    ) {
      return false;
    }
    if (categoryFilter !== "all" && notification.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-purple-700 flex items-center">
          <Bell className="mr-2 h-6 w-6" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-pink-500 text-white">{unreadCount}</Badge>
          )}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some((n) => !n.read)}
            className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="text-xs border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-medium">
                  Notification Center
                </CardTitle>
                <div className="flex gap-2">
                  <select
                    className="text-sm border rounded-md px-2 py-1 bg-white"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                  <select
                    className="text-sm border rounded-md px-2 py-1 bg-white"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                  >
                    <option value="all">All Categories</option>
                    <option value="calendar">Calendar</option>
                    <option value="budget">Budget</option>
                    <option value="family">Family</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-12 w-12 text-gray-300 animate-spin" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Loading notifications...
                  </h3>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-300" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Error loading notifications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No notifications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {notifications.length === 0
                      ? "You're all caught up!"
                      : "No notifications match your current filters."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${notification.read ? "bg-white" : "bg-purple-50 border-purple-200"}`}
                      onClick={(e) => {
                        if (!notification.read) {
                          e.preventDefault();
                          handleMarkAsRead(notification.id);
                        }
                      }}
                      style={{
                        cursor: notification.read ? "default" : "pointer",
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getCategoryIcon(notification.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {notification.title}
                              </h3>
                              <Badge
                                className={getTypeStyles(notification.type)}
                              >
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span>
                                {format(
                                  parseISO(notification.created_at),
                                  "MMM d, h:mm a",
                                )}
                              </span>
                              <span className="mx-2">•</span>
                              <span className="capitalize">
                                {notification.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleMarkAsRead(notification.id);
                              }}
                              aria-label="Mark as read"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteNotification(notification.id);
                            }}
                            aria-label="Delete notification"
                            title="Delete notification"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-medium">
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive all notifications
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={() =>
                    handleToggleSetting("enableNotifications")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="calendar">Calendar Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Events, appointments, and deadlines
                  </p>
                </div>
                <Switch
                  id="calendar"
                  checked={settings.calendarReminders}
                  onCheckedChange={() =>
                    handleToggleSetting("calendarReminders")
                  }
                  disabled={!settings.enableNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="budget">Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Budget thresholds and financial updates
                  </p>
                </div>
                <Switch
                  id="budget"
                  checked={settings.budgetAlerts}
                  onCheckedChange={() => handleToggleSetting("budgetAlerts")}
                  disabled={!settings.enableNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="family">Family Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Family member activities and milestones
                  </p>
                </div>
                <Switch
                  id="family"
                  checked={settings.familyUpdates}
                  onCheckedChange={() => handleToggleSetting("familyUpdates")}
                  disabled={!settings.enableNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system">System Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    App updates and important announcements
                  </p>
                </div>
                <Switch
                  id="system"
                  checked={settings.systemNotifications}
                  onCheckedChange={() =>
                    handleToggleSetting("systemNotifications")
                  }
                  disabled={!settings.enableNotifications}
                />
              </div>

              {settingsError && (
                <div className="text-red-500 text-sm mt-4">
                  Error: {settingsError}
                </div>
              )}
              <Button
                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600"
                onClick={saveNotificationSettings}
                disabled={savingSettings}
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyNotifications;
