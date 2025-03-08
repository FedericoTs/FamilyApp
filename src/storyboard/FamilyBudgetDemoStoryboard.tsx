import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import FamilyBudget from "@/components/family/FamilyBudget";

export default function FamilyBudgetDemoStoryboard() {
  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-purple-700">
            Family Budget Management
          </h1>
          <p className="mb-6 text-gray-600">
            This budget management system allows you to track your family's
            expenses, set budgets for different categories, and visualize your
            spending patterns.
          </p>
          <FamilyBudget />
        </div>
      </div>
    </AuthProvider>
  );
}
