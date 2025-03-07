import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import FamilyDashboard from "@/components/family/FamilyDashboard";
import FamilyCalendar from "@/components/family/FamilyCalendar";
import FamilyTasks from "@/components/family/FamilyTasks";
import FamilyBudget from "@/components/family/FamilyBudget";
import FamilyNotifications from "@/components/family/FamilyNotifications";
import { Loader2 } from "lucide-react";

const Family = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { profile, familyMembers, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading family data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">My Family</h1>
          <p className="text-gray-600 mt-1">
            Manage your family's schedule, tasks, and budget in one place
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
            Family Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <FamilyDashboard familyMembers={familyMembers} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <FamilyCalendar familyMembers={familyMembers} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <FamilyTasks familyMembers={familyMembers} />
        </TabsContent>

        <TabsContent value="budget" className="mt-0">
          <FamilyBudget />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <FamilyNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Family;
