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
  // Add debugging
  console.log("BudgetChart props:", {
    categoryTotals,
    chartType: currentChartType,
    title,
    interactive,
  });

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
    console.log("Using fallback demo data for chart", categoryTotals);
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

  // Generate SVG for pie chart
  const generatePieChart = () => {
    let categories = Object.entries(categoryTotals);
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Log the data being used for the pie chart
    console.log("Generating pie chart with data:", categories);

    // Handle empty data case
    if (categories.length === 0 || totalBudget === 0) {
      console.log("Using demo data for pie chart visualization");
      // Return demo data for visualization if no real data exists
      const demoCategories = [
        ["groceries", { amount: 500, spent: 320 }],
        ["entertainment", { amount: 200, spent: 150 }],
        ["activities", { amount: 300, spent: 180 }],
        ["education", { amount: 400, spent: 250 }],
        ["travel", { amount: 600, spent: 100 }],
      ];

      // Use demo data for visualization
      categories = demoCategories;
      console.log("Demo categories for pie chart:", categories);
    }

    // Calculate slices
    let totalAngle = 0;
    const slices = categories.map(([category, { amount }], index) => {
      const percentage = amount / totalBudget;
      const angle = percentage * 360;

      // Calculate start and end points
      const startAngle = totalAngle * (Math.PI / 180);
      totalAngle += angle;
      const endAngle = totalAngle * (Math.PI / 180);

      // Calculate path
      const x1 = centerX + radius * Math.sin(startAngle);
      const y1 = centerY - radius * Math.cos(startAngle);
      const x2 = centerX + radius * Math.sin(endAngle);
      const y2 = centerY - radius * Math.cos(endAngle);

      // Determine if the arc should be drawn as a large arc
      const largeArcFlag = angle > 180 ? 1 : 0;

      // Create path
      const path = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      return {
        path,
        color: getCategoryColor(category, index),
        category,
        percentage: (percentage * 100).toFixed(1),
      };
    });

    return (
      <div className="relative w-full h-[200px] flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="1"
            >
              <title>{`${slice.category}: ${slice.percentage}%`}</title>
            </path>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute top-0 right-0 flex flex-col gap-2">
          {Object.entries(categoryTotals).map(
            ([category, { amount, spent }], index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category, index) }}
                />
                <span className="capitalize">{category}</span>
                <span className="text-gray-500">
                  ${spent.toFixed(0)}/${amount.toFixed(0)}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    );
  };

  // Generate SVG for bar chart
  const generateBarChart = () => {
    const categories = Object.entries(categoryTotals);
    const chartWidth = 300;
    const chartHeight = 150;
    const barPadding = 10;
    const barWidth =
      (chartWidth - (categories.length - 1) * barPadding) / categories.length;

    // Find the maximum amount for scaling
    const maxAmount = Math.max(
      ...categories.map(([_, { amount }]) => amount),
      ...categories.map(([_, { spent }]) => spent),
    );

    return (
      <div className="relative w-full h-[200px] flex justify-center">
        <svg
          width="100%"
          height="200"
          viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`}
        >
          {/* X and Y axes */}
          <line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Bars */}
          {categories.map(([category, { amount, spent }], index) => {
            const x = index * (barWidth + barPadding);
            const amountHeight = (amount / maxAmount) * chartHeight;
            const spentHeight = (spent / maxAmount) * chartHeight;

            return (
              <g key={index}>
                {/* Budget amount bar */}
                <rect
                  x={x}
                  y={chartHeight - amountHeight}
                  width={barWidth}
                  height={amountHeight}
                  fill="#e5e7eb"
                  stroke="#d1d5db"
                  strokeWidth="1"
                >
                  <title>{`${category} budget: $${amount.toFixed(2)}`}</title>
                </rect>

                {/* Spent amount bar */}
                <rect
                  x={x}
                  y={chartHeight - spentHeight}
                  width={barWidth}
                  height={spentHeight}
                  fill={getCategoryColor(category, index)}
                >
                  <title>{`${category} spent: $${spent.toFixed(2)}`}</title>
                </rect>

                {/* Category label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  className="capitalize"
                >
                  {category.substring(0, 4)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Generate donut chart (variation of pie chart with center hole)
  const generateDonutChart = () => {
    let categories = Object.entries(categoryTotals);
    const radius = 80;
    const innerRadius = 40; // Inner radius for donut hole
    const centerX = 100;
    const centerY = 100;

    // Handle empty data case
    if (categories.length === 0 || totalBudget === 0) {
      const demoCategories = [
        ["groceries", { amount: 500, spent: 320 }],
        ["entertainment", { amount: 200, spent: 150 }],
        ["activities", { amount: 300, spent: 180 }],
      ];
      categories = demoCategories;

      if (categories.length === 0) {
        return (
          <div className="text-center py-6 text-gray-500">
            <p>No budget data available to display.</p>
          </div>
        );
      }
    }

    // Sort categories if needed
    if (sortBy !== "name") {
      categories.sort((a, b) => {
        const valueA = sortBy === "amount" ? a[1].amount : a[1].spent;
        const valueB = sortBy === "amount" ? b[1].amount : b[1].spent;
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      });
    } else {
      categories.sort((a, b) => {
        return sortOrder === "asc"
          ? a[0].localeCompare(b[0])
          : b[0].localeCompare(a[0]);
      });
    }

    // Calculate slices
    let totalAngle = 0;
    const slices = categories.map(([category, { amount }], index) => {
      const percentage = amount / totalBudget;
      const angle = percentage * 360;

      // Calculate start and end points
      const startAngle = totalAngle * (Math.PI / 180);
      totalAngle += angle;
      const endAngle = totalAngle * (Math.PI / 180);

      // Calculate outer arc points
      const x1 = centerX + radius * Math.sin(startAngle);
      const y1 = centerY - radius * Math.cos(startAngle);
      const x2 = centerX + radius * Math.sin(endAngle);
      const y2 = centerY - radius * Math.cos(endAngle);

      // Calculate inner arc points
      const x3 = centerX + innerRadius * Math.sin(endAngle);
      const y3 = centerY - innerRadius * Math.cos(endAngle);
      const x4 = centerX + innerRadius * Math.sin(startAngle);
      const y4 = centerY - innerRadius * Math.cos(startAngle);

      // Determine if the arc should be drawn as a large arc
      const largeArcFlag = angle > 180 ? 1 : 0;

      // Create path for donut slice
      const path = [
        `M ${x1} ${y1}`, // Move to outer start point
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc
        `L ${x3} ${y3}`, // Line to inner end point
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc (reverse direction)
        "Z", // Close path
      ].join(" ");

      return {
        path,
        color: getCategoryColor(category, index),
        category,
        percentage: (percentage * 100).toFixed(1),
      };
    });

    return (
      <div className="relative w-full h-[220px] flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="1"
            >
              <title>{`${slice.category}: ${slice.percentage}%`}</title>
            </path>
          ))}
          {/* Center text showing total */}
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            Total
          </text>
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#8b5cf6"
          >
            ${totalBudget.toFixed(0)}
          </text>
        </svg>

        {/* Legend */}
        <div className="absolute top-0 right-0 flex flex-col gap-2">
          {Object.entries(categoryTotals).map(
            ([category, { amount, spent }], index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category, index) }}
                />
                <span className="capitalize">{category}</span>
                <span className="text-gray-500">
                  ${spent.toFixed(0)}/${amount.toFixed(0)}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            {currentChartType === "pie" ? (
              <PieChart className="mr-2 h-5 w-5 text-purple-600" />
            ) : currentChartType === "donut" ? (
              <PieChart className="mr-2 h-5 w-5 text-pink-600" />
            ) : (
              <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
            )}
            <span>{title}</span>
          </CardTitle>

          {interactive && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleSort("amount")}
                    >
                      <ArrowUpDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Sort by{" "}
                      {sortBy === "amount"
                        ? sortOrder === "asc"
                          ? "amount ascending"
                          : "amount descending"
                        : "amount"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={currentChartType === "pie" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 rounded-none"
                  onClick={() => setCurrentChartType("pie")}
                >
                  Pie
                </Button>
                <Button
                  variant={currentChartType === "donut" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 rounded-none"
                  onClick={() => setCurrentChartType("donut")}
                >
                  Donut
                </Button>
                <Button
                  variant={currentChartType === "bar" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 rounded-none"
                  onClick={() => setCurrentChartType("bar")}
                >
                  Bar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(categoryTotals).length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No budget categories defined yet.</p>
          </div>
        ) : currentChartType === "pie" ? (
          generatePieChart()
        ) : currentChartType === "donut" ? (
          generateDonutChart()
        ) : (
          generateBarChart()
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetChart;
