import React from "react";
import FamilyNotifications from "@/components/family/FamilyNotifications";
import { AuthProvider } from "@/contexts/AuthContext";

export default function FamilyNotificationsStoryboard() {
  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <FamilyNotifications />
      </div>
    </AuthProvider>
  );
}
