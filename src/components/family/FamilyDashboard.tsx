import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FamilyMember } from "@/types/profile";
import {
  Calendar,
  CheckSquare,
  DollarSign,
  Bell,
  ArrowRight,
} from "lucide-react";

interface FamilyDashboardProps {
  familyMembers: FamilyMember[];
}

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  familyMembers = [],
}) => {
  // Mock data for dashboard
  const upcomingEvents = [
    {
      id: 1,
      title: "Sarah's Soccer Practice",
      date: "Today, 4:00 PM",
      type: "activity",
    },
    {
      id: 2,
      title: "Family Dinner with Grandparents",
      date: "Tomorrow, 6:30 PM",
      type: "family",
    },
    {
      id: 3,
      title: "School Parent-Teacher Conference",
      date: "May 15, 3:00 PM",
      type: "school",
    },
  ];

  const pendingTasks = [
    {
      id: 1,
      title: "Buy groceries for the week",
      assignedTo: "Mom",
      dueDate: "Today",
    },
    {
      id: 2,
      title: "Pick up birthday cake",
      assignedTo: "Dad",
      dueDate: "Tomorrow",
    },
    {
      id: 3,
      title: "Complete science project",
      assignedTo: "Emma",
      dueDate: "May 14",
    },
  ];

  const budgetSummary = {
    monthlyBudget: 1200,
    spent: 750,
    remaining: 450,
    categories: [
      { name: "Groceries", amount: 320, percentage: 42 },
      { name: "Activities", amount: 180, percentage: 24 },
      { name: "Dining Out", amount: 150, percentage: 20 },
      { name: "Other", amount: 100, percentage: 14 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Family Members Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center">
            <span>Family Members</span>
            <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
              {familyMembers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {familyMembers.length > 0 ? (
              familyMembers.map((member) => (
                <div key={member.id} className="flex flex-col items-center">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                    />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs text-gray-500">
                    {member.relationship}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center w-full py-4">
                <p className="text-gray-500">No family members added yet.</p>
                <Button variant="link" className="mt-2 text-purple-600">
                  Add family members
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Events Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-600" />
              <span>Upcoming Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-500">{event.date}</p>
                  </div>
                  <Badge
                    className={`${
                      event.type === "activity"
                        ? "bg-green-100 text-green-800"
                        : event.type === "family"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            >
              <span>View Calendar</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-pink-600" />
              <span>Pending Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-500">
                      Assigned to: {task.assignedTo}
                    </p>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">
                    {task.dueDate}
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-pink-600 hover:text-pink-800 hover:bg-pink-50"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              <span>Budget Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Monthly Budget</p>
                <p className="text-xl font-bold">
                  ${budgetSummary.monthlyBudget}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Spent</p>
                <p className="text-xl font-bold text-pink-600">
                  ${budgetSummary.spent}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-xl font-bold text-green-600">
                  ${budgetSummary.remaining}
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {budgetSummary.categories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category.name}</span>
                    <span>${category.amount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4 text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              <span>View Budget Details</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold flex items-center">
              <Bell className="mr-2 h-5 w-5 text-amber-600" />
              <span>Recent Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800">School Reminder</h4>
                <p className="text-sm text-blue-600">
                  Don't forget - early dismissal this Friday at 1:30 PM
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <h4 className="font-medium text-amber-800">
                  Birthday Coming Up
                </h4>
                <p className="text-sm text-amber-600">
                  Emma's birthday is in 2 weeks. Start planning!
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-medium text-green-800">Budget Alert</h4>
                <p className="text-sm text-green-600">
                  You've used 75% of your monthly dining budget
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            >
              <span>Manage Notifications</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyDashboard;
