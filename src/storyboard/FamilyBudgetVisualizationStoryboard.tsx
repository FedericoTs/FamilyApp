import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import FamilyBudget from "@/components/family/FamilyBudget";

export default function FamilyBudgetVisualizationStoryboard() {
  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-purple-700">
            Family Budget Visualization
          </h1>
          <FamilyBudget />
        </div>
      </div>
    </AuthProvider>
  );
}
