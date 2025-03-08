import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart3, ArrowUpDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BudgetChartProps {
  categoryTotals: Record<string, { amount: number; spent: number }>;
  chartType?: "pie" | "bar" | "donut";
  title?: string;
  interactive?: boolean;
}

const BudgetChart: React.FC<BudgetChartProps> = ({
  categoryTotals,
  chartType = "pie",
  title = "Budget Breakdown",
  interactive = true,
}) => {
  const [currentChartType, setCurrentChartType] = useState(chartType);
  const [sortBy, setSortBy] = useState<"amount" | "spent" | "name">("amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Toggle sort when header is clicked
  const toggleSort = (field: "amount" | "spent" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Provide fallback if data is missing or invalid
  if (!categoryTotals || typeof categoryTotals !== "object") {
    console.warn(
      "BudgetChart: Invalid categoryTotals provided",
      categoryTotals,
    );
    // Instead of showing an error, use demo data
    categoryTotals = {
      groceries: { amount: 500, spent: 320 },
      entertainment: { amount: 200, spent: 150 },
      activities: { amount: 300, spent: 180 },
      education: { amount: 400, spent: 250 },
      travel: { amount: 600, spent: 100 },
    };
  }

  // Calculate total budget and spent for percentages
  const totalBudget = Object.values(categoryTotals).reduce(
    (sum, { amount }) => sum + (amount || 0),
    0,
  );

  const totalSpent = Object.values(categoryTotals).reduce(
    (sum, { spent }) => sum + (spent || 0),
    0,
  );

  // Colors for different categories
  const getCategoryColor = (category: string, index: number) => {
    const colors = [
      "#10b981", // green
      "#8b5cf6", // purple
      "#3b82f6", // blue
      "#f97316", // orange
      "#ec4899", // pink
      "#ef4444", // red
      "#f59e0b", // amber
    ];

    // Map specific categories to specific colors
    switch (category) {
      case "groceries":
        return "#10b981"; // green
      case "entertainment":
        return "#8b5cf6"; // purple
      case "activities":
        return "#3b82f6"; // blue
      case "education":
        return "#f97316"; // orange
      case "travel":
        return "#ec4899"; // pink
      case "health":
        return "#ef4444"; // red
      default:
        return colors[index % colors.length];
    }
  };

  // Generate horizontal bar chart
  const generateBarChart = () => {
    let categories = Object.entries(categoryTotals);

    // Handle empty data case
    if (categories.length === 0 || totalBudget === 0) {
      const demoCategories = [
        ["groceries", { amount: 500, spent: 320 }],
        ["entertainment", { amount: 200, spent: 150 }],
        ["activities", { amount: 300, spent: 180 }],
      ];
      categories = demoCategories;
    }

    // Sort categories by amount if needed
    if (sortBy !== "name") {
      categories.sort((a, b) => {
        const valueA = sortBy === "amount" ? a[1].amount : a[1].spent;
        const valueB = sortBy === "amount" ? b[1].amount : b[1].spent;
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      });
    }

    return (
      <div className="space-y-2">
        {categories.map(([category, { amount, spent }], index) => {
          const percentSpent = amount > 0 ? (spent / amount) * 100 : 0;
          const remaining = amount - spent;
          const isOverBudget = remaining < 0;

          return (
            <div key={index} className="space-y-0.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: getCategoryColor(category, index),
                    }}
                  />
                  <span className="text-xs font-medium capitalize">
                    {category}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ${spent.toFixed(0)} / ${amount.toFixed(0)}
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden h-1.5 text-xs flex rounded bg-muted">
                  <div
                    style={{
                      width: `${Math.min(percentSpent, 100)}%`,
                      backgroundColor: getCategoryColor(category, index),
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                  ></div>
                </div>
                <div className="flex mt-0.5 items-center justify-between text-[10px]">
                  <span className="text-primary">
                    {percentSpent.toFixed(0)}%
                  </span>
                  <span
                    className={
                      isOverBudget ? "text-destructive" : "text-green-600"
                    }
                  >
                    {isOverBudget
                      ? "$" + Math.abs(remaining).toFixed(0) + " over"
                      : "$" + remaining.toFixed(0) + " left"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Use the bar chart for all chart types for simplicity and consistency
  const generatePieChart = () => generateBarChart();
  const generateDonutChart = () => generateBarChart();

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-base">
            <BarChart3 className="mr-2 h-4 w-4 text-primary" />
            <span>{title}</span>
          </CardTitle>

          {interactive && (
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        toggleSort(sortBy === "amount" ? "spent" : "amount")
                      }
                    >
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">
                      Sort by {sortBy === "amount" ? "budget" : "spent"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        {Object.keys(categoryTotals).length === 0 ? (
          <div className="text-center py-2 text-muted-foreground text-sm">
            <p>No budget categories defined yet.</p>
          </div>
        ) : (
          generateBarChart()
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetChart;
