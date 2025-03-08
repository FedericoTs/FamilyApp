import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import FamilyBudget from "@/components/family/FamilyBudget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BudgetChart from "@/components/family/BudgetChart";
import BudgetSummaryCards from "@/components/family/BudgetSummaryCards";
import ExpenseTimeline from "@/components/family/ExpenseTimeline";

export default function BudgetDebugStoryboard() {
  // Sample data for testing visualizations
  const sampleCategoryTotals = {
    groceries: { amount: 500, spent: 320 },
    entertainment: { amount: 200, spent: 150 },
    activities: { amount: 300, spent: 180 },
  };

  const sampleExpenses = [
    {
      id: "1",
      title: "Weekly Grocery Shopping",
      amount: 120,
      date: new Date(2023, 5, 1),
      category: "groceries",
    },
    {
      id: "2",
      title: "Movie Tickets",
      amount: 45,
      date: new Date(2023, 5, 3),
      category: "entertainment",
    },
  ];

  // Calculate totals for summary cards
  const totalBudget = Object.values(sampleCategoryTotals).reduce(
    (sum, { amount }) => sum + amount,
    0,
  );
  const totalSpent = Object.values(sampleCategoryTotals).reduce(
    (sum, { spent }) => sum + spent,
    0,
  );
  const totalRemaining = totalBudget - totalSpent;

  return (
    <AuthProvider>
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-purple-700">
            Budget Visualization Debug
          </h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Testing Individual Components</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This storyboard tests each visualization component with sample
                  data.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mt-6 mb-3">
              BudgetSummaryCards Component
            </h2>
            <BudgetSummaryCards
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
              previousPeriodSpent={800}
            />

            <h2 className="text-xl font-semibold mt-6 mb-3">
              BudgetChart Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BudgetChart
                categoryTotals={sampleCategoryTotals}
                chartType="pie"
                title="Pie Chart Test"
              />

              <BudgetChart
                categoryTotals={sampleCategoryTotals}
                chartType="bar"
                title="Bar Chart Test"
              />

              <BudgetChart
                categoryTotals={sampleCategoryTotals}
                chartType="donut"
                title="Donut Chart Test"
              />

              <BudgetChart
                categoryTotals={{}}
                chartType="pie"
                title="Empty Data Test"
              />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-3">
              ExpenseTimeline Component
            </h2>
            <ExpenseTimeline
              expenses={sampleExpenses}
              period="month"
              title="Expense Timeline Test"
            />

            <h2 className="text-xl font-semibold mt-6 mb-3">
              Full FamilyBudget Component
            </h2>
            <FamilyBudget />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
