import React from "react";
import FamilyBudget from "@/components/family/FamilyBudget";
import { AuthProvider } from "@/contexts/AuthContext";

export default function FamilyBudgetStoryboard() {
  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <FamilyBudget />
      </div>
    </AuthProvider>
  );
}
