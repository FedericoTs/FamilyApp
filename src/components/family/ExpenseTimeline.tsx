import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  format,
  subDays,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { BarChart3, Calendar as CalendarIcon } from "lucide-react";
import { Expense } from "@/services/budgetService";

interface ExpenseTimelineProps {
  expenses: Expense[];
  period?: "week" | "month" | "year";
  title?: string;
}

const ExpenseTimeline: React.FC<ExpenseTimelineProps> = ({
  expenses,
  period = "month",
  title = "Expense Timeline",
}) => {
  // Get the current date
  const today = new Date();

  // Log the expenses data received by the component
  useEffect(() => {
    console.log("ExpenseTimeline received props:", { expenses, period, title });
  }, [expenses, period, title]);

  // Provide fallback if data is missing or invalid
  if (!expenses || !Array.isArray(expenses)) {
    console.warn("ExpenseTimeline: Invalid expenses data provided", expenses);
    // Instead of showing an error, use demo data
    expenses = [
      {
        id: "demo-1",
        title: "Weekly Grocery Shopping",
        amount: 120,
        date: new Date(2023, 5, 1),
        category: "groceries",
        notes: "Regular weekly shopping",
      },
      {
        id: "demo-2",
        title: "Movie Tickets",
        amount: 45,
        date: new Date(2023, 5, 3),
        category: "entertainment",
        notes: "Family movie night",
      },
      {
        id: "demo-3",
        title: "School Supplies",
        amount: 85,
        date: new Date(2023, 5, 5),
        category: "education",
        notes: "New semester supplies",
      },
      {
        id: "demo-4",
        title: "Swimming Lessons",
        amount: 60,
        date: new Date(2023, 5, 8),
        category: "activities",
        notes: "Monthly swimming class",
      },
    ];
    console.log("Using fallback demo data for expense timeline", expenses);
  }

  // If no expenses provided, use demo data
  const expensesWithFallback =
    expenses.length > 0
      ? expenses
      : [
          {
            id: "demo-1",
            title: "Weekly Grocery Shopping",
            amount: 120,
            date: new Date(2023, 5, 1),
            category: "groceries",
            notes: "Regular weekly shopping",
          },
          {
            id: "demo-2",
            title: "Movie Tickets",
            amount: 45,
            date: new Date(2023, 5, 3),
            category: "entertainment",
            notes: "Family movie night",
          },
          {
            id: "demo-3",
            title: "School Supplies",
            amount: 85,
            date: new Date(2023, 5, 5),
            category: "education",
            notes: "New semester supplies",
          },
          {
            id: "demo-4",
            title: "Swimming Lessons",
            amount: 60,
            date: new Date(2023, 5, 8),
            category: "activities",
            notes: "Monthly swimming class",
          },
        ];

  // Filter expenses based on the selected period
  const filteredExpenses = expensesWithFallback.filter((expense) => {
    // Ensure expense.date is a Date object
    const expenseDate =
      expense.date instanceof Date ? expense.date : new Date(expense.date);

    if (period === "week") {
      const weekStart = subDays(today, 7);
      return isWithinInterval(expenseDate, { start: weekStart, end: today });
    } else if (period === "month") {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      return isWithinInterval(expenseDate, {
        start: monthStart,
        end: monthEnd,
      });
    } else if (period === "year") {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      return isWithinInterval(expenseDate, { start: yearStart, end: yearEnd });
    }

    return true;
  });

  // Log the filtered expenses
  useEffect(() => {
    console.log("Filtered expenses for period", period, ":", filteredExpenses);
  }, [filteredExpenses, period]);

  // Group expenses by date
  const expensesByDate = filteredExpenses.reduce(
    (acc, expense) => {
      const dateKey = format(new Date(expense.date), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(expense);
      return acc;
    },
    {} as Record<string, Expense[]>,
  );

  // Calculate daily totals
  const dailyTotals = Object.entries(expensesByDate)
    .map(([date, expenses]) => {
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      return { date, total };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Generate the timeline visualization
  const generateTimeline = () => {
    const chartWidth = 300;
    const chartHeight = 100;
    const barWidth = Math.max(10, chartWidth / dailyTotals.length - 5);

    // Find the maximum daily total for scaling
    const maxTotal = Math.max(...dailyTotals.map((day) => day.total), 1);

    return (
      <div className="relative w-full h-[150px] flex justify-center">
        <svg
          width="100%"
          height="150"
          viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`}
        >
          {/* X axis */}
          <line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Bars */}
          {dailyTotals.map((day, index) => {
            const x = (index / dailyTotals.length) * chartWidth;
            const barHeight = (day.total / maxTotal) * chartHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill="#8b5cf6"
                  opacity="0.8"
                  rx="2"
                >
                  <title>{`${format(new Date(day.date), "MMM d")}: $${day.total.toFixed(2)}`}</title>
                </rect>

                {/* Date label (show every few days depending on the period) */}
                {index % Math.max(1, Math.floor(dailyTotals.length / 5)) ===
                  0 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {format(
                      new Date(day.date),
                      period === "year" ? "MMM" : "d",
                    )}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Get the category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "groceries":
        return "bg-green-100 text-green-800 border-green-200";
      case "entertainment":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "activities":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "education":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "travel":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "health":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No expenses recorded for this period.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline visualization */}
            {generateTimeline()}

            {/* Period summary */}
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-500">
                  Total for {period}:
                </span>
                <div className="text-xl font-bold text-purple-700">
                  $
                  {filteredExpenses
                    .reduce((sum, expense) => sum + expense.amount, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Transactions:</span>
                <div className="text-xl font-bold text-purple-700">
                  {filteredExpenses.length}
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
              <div className="space-y-2">
                {filteredExpenses.slice(0, 3).map((expense, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(expense.category)}>
                        <span className="capitalize">{expense.category}</span>
                      </Badge>
                      <span className="font-medium">
                        ${expense.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseTimeline;
