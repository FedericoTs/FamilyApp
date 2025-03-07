import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationBell from "@/components/NotificationBell";
import { AuthProvider } from "@/contexts/AuthContext";

export default function NotificationSystemStoryboard() {
  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Family Calendar Notification System</CardTitle>
              <NotificationBell />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>The notification system provides alerts for:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Event Reminders</strong> - Standard reminders for
                  upcoming events
                </li>
                <li>
                  <strong>Appointment Alerts</strong> - Urgent reminders for
                  appointments
                </li>
                <li>
                  <strong>Deadline Notifications</strong> - Alerts for
                  approaching deadlines
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Click the notification bell icon to see your notifications. The
                system automatically creates notifications when you add events
                to the calendar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthProvider>
  );
}
