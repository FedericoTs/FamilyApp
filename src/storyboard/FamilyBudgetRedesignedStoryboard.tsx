import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import FamilyBudgetRedesigned from "@/components/family/FamilyBudgetRedesigned";

export default function FamilyBudgetRedesignedStoryboard() {
  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-purple-700">
            Family Budget (Redesigned)
          </h1>
          <p className="mb-6 text-gray-600">
            This is the redesigned budget management system that properly
            displays data from the family_expenses and family_budgets tables.
          </p>
          <FamilyBudgetRedesigned />
        </div>
      </div>
    </AuthProvider>
  );
}
