import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BudgetChart from "@/components/family/BudgetChart";
import ExpenseTimeline from "@/components/family/ExpenseTimeline";
import BudgetSummaryCards from "@/components/family/BudgetSummaryCards";

export default function BudgetVisualizationStoryboard() {
  // Sample data for visualizations
  const categoryTotals = {
    groceries: { amount: 500, spent: 320 },
    entertainment: { amount: 200, spent: 150 },
    activities: { amount: 300, spent: 180 },
    education: { amount: 400, spent: 250 },
    travel: { amount: 600, spent: 100 },
  };

  const sampleExpenses = [
    {
      id: "1",
      title: "Weekly Grocery Shopping",
      amount: 120,
      date: new Date(2023, 5, 1),
      category: "groceries",
      notes: "Regular weekly shopping",
    },
    {
      id: "2",
      title: "Movie Tickets",
      amount: 45,
      date: new Date(2023, 5, 3),
      category: "entertainment",
      notes: "Family movie night",
    },
    {
      id: "3",
      title: "School Supplies",
      amount: 85,
      date: new Date(2023, 5, 5),
      category: "education",
      notes: "New semester supplies",
    },
    {
      id: "4",
      title: "Swimming Lessons",
      amount: 60,
      date: new Date(2023, 5, 8),
      category: "activities",
      notes: "Monthly swimming class",
    },
    {
      id: "5",
      title: "Weekend Getaway",
      amount: 100,
      date: new Date(2023, 5, 12),
      category: "travel",
      notes: "Day trip to the beach",
    },
    {
      id: "6",
      title: "Organic Produce",
      amount: 75,
      date: new Date(2023, 5, 15),
      category: "groceries",
      notes: "Farmers market shopping",
    },
    {
      id: "7",
      title: "Concert Tickets",
      amount: 105,
      date: new Date(2023, 5, 18),
      category: "entertainment",
      notes: "Live music event",
    },
    {
      id: "8",
      title: "Textbooks",
      amount: 165,
      date: new Date(2023, 5, 22),
      category: "education",
      notes: "Required reading materials",
    },
  ];

  // Calculate totals
  const totalBudget = Object.values(categoryTotals).reduce(
    (sum, { amount }) => sum + amount,
    0,
  );
  const totalSpent = Object.values(categoryTotals).reduce(
    (sum, { spent }) => sum + spent,
    0,
  );
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">
        Budget Visualization Components
      </h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget Summary Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetSummaryCards
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
              previousPeriodSpent={950} // Sample previous period data
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pie Chart Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetChart
                categoryTotals={categoryTotals}
                chartType="pie"
                title="Budget Allocation"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Chart Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetChart
                categoryTotals={categoryTotals}
                chartType="bar"
                title="Budget vs. Spending"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseTimeline
              expenses={sampleExpenses}
              period="month"
              title="Monthly Expense Trend"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
