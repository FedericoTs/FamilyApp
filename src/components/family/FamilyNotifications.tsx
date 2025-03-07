import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  DollarSign,
  Users,
  Check,
  X,
  Settings,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "reminder" | "alert" | "info";
  category: "calendar" | "budget" | "family" | "system";
  read: boolean;
}

const FamilyNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "School Early Dismissal",
      message: "Don't forget - early dismissal this Friday at 1:30 PM",
      date: "Today",
      type: "reminder",
      category: "calendar",
      read: false,
    },
    {
      id: "2",
      title: "Emma's Birthday",
      message: "Emma's birthday is in 2 weeks. Start planning!",
      date: "Yesterday",
      type: "reminder",
      category: "family",
      read: false,
    },
    {
      id: "3",
      title: "Budget Alert",
      message: "You've used 75% of your monthly dining budget",
      date: "2 days ago",
      type: "alert",
      category: "budget",
      read: true,
    },
    {
      id: "4",
      title: "Dentist Appointment",
      message:
        "Reminder: Dentist appointment for the kids next Monday at 10:00 AM",
      date: "3 days ago",
      type: "reminder",
      category: "calendar",
      read: true,
    },
    {
      id: "5",
      title: "Family Photo Album",
      message: "New photos added to the family album by Mom",
      date: "1 week ago",
      type: "info",
      category: "family",
      read: true,
    },
  ]);

  const [settings, setSettings] = useState({
    enableNotifications: true,
    calendarReminders: true,
    budgetAlerts: true,
    familyUpdates: true,
    systemNotifications: true,
  });

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "calendar" | "budget" | "family" | "system"
  >("all");

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id),
    );
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
    }
  };

  const handleToggleSetting = (setting: keyof typeof settings) => {
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

  // Filter notifications based on read status and category
  const filteredNotifications = notifications.filter((notification) => {
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
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
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
                              <span>{notification.date}</span>
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
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
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

              <Button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyNotifications;
