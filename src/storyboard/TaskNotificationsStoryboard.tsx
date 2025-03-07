import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationBell from "@/components/NotificationBell";
import { AuthProvider } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Bell, Clock, AlertCircle } from "lucide-react";

export default function TaskNotificationsStoryboard() {
  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <CheckSquare className="mr-2 h-5 w-5 text-purple-600" />
                Family Tasks Notification System
              </CardTitle>
              <NotificationBell />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p>
                The task notification system automatically alerts you about:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center text-blue-700">
                      <Clock className="mr-2 h-4 w-4" />
                      Due Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-blue-600">
                      Reminders for tasks that need to be completed today
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center text-amber-700">
                      <Bell className="mr-2 h-4 w-4" />
                      Due Tomorrow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-amber-600">
                      Advance notice for tasks due the next day
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center text-red-700">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Overdue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-red-600">
                      Alerts for tasks that have passed their due date
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-800 mb-2">
                  Priority-Based Notifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    High Priority
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    Medium Priority
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Low Priority
                  </Badge>
                </div>
                <p className="text-sm text-purple-700 mt-2">
                  High priority tasks generate urgent alerts, while medium and
                  low priority tasks create standard reminders.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  The system automatically checks for tasks that need attention:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>When you load the tasks page</li>
                  <li>When you add a new task that's due soon</li>
                  <li>Daily via an automated background process</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthProvider>
  );
}
