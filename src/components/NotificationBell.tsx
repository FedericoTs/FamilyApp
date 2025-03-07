import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-blue-100 text-blue-800";
      case "alert":
        return "bg-red-100 text-red-800";
      case "info":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 ${notification.read ? "" : "bg-blue-50"}`}
                  onClick={() =>
                    !notification.read && handleMarkAsRead(notification.id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(
                          parseISO(notification.created_at),
                          "MMM d, h:mm a",
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        className={`${getNotificationTypeColor(notification.type)} text-xs`}
                      >
                        {notification.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        &times;
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2 text-center">
          <Button
            variant="link"
            size="sm"
            className="text-purple-600 text-xs"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
