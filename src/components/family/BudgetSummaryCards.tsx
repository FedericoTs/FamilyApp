import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface BudgetSummaryCardsProps {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  previousPeriodSpent?: number;
}

const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  totalBudget,
  totalSpent,
  totalRemaining,
  previousPeriodSpent,
}) => {
  // Log the props received by the component
  useEffect(() => {
    console.log("BudgetSummaryCards received props:", {
      totalBudget,
      totalSpent,
      totalRemaining,
      previousPeriodSpent,
    });
  }, [totalBudget, totalSpent, totalRemaining, previousPeriodSpent]);

  // Ensure we have valid numbers to display
  const validTotalBudget =
    isNaN(totalBudget) || totalBudget === null || totalBudget === undefined
      ? 0
      : totalBudget;
  const validTotalSpent =
    isNaN(totalSpent) || totalSpent === null || totalSpent === undefined
      ? 0
      : totalSpent;
  const validTotalRemaining =
    isNaN(totalRemaining) ||
    totalRemaining === null ||
    totalRemaining === undefined
      ? 0
      : totalRemaining;

  // Add more detailed debugging
  useEffect(() => {
    if (
      isNaN(totalBudget) ||
      totalBudget === null ||
      totalBudget === undefined
    ) {
      console.warn(
        "BudgetSummaryCards: Invalid totalBudget value",
        totalBudget,
      );
    }
    if (isNaN(totalSpent) || totalSpent === null || totalSpent === undefined) {
      console.warn("BudgetSummaryCards: Invalid totalSpent value", totalSpent);
    }
    if (
      isNaN(totalRemaining) ||
      totalRemaining === null ||
      totalRemaining === undefined
    ) {
      console.warn(
        "BudgetSummaryCards: Invalid totalRemaining value",
        totalRemaining,
      );
    }
  }, [totalBudget, totalSpent, totalRemaining]);

  // Calculate spending trend if previous period data is available
  const spendingTrend =
    previousPeriodSpent && previousPeriodSpent > 0
      ? ((validTotalSpent - previousPeriodSpent) / previousPeriodSpent) * 100
      : null;

  // Calculate percentage of budget spent
  const percentageSpent =
    validTotalBudget > 0 ? (validTotalSpent / validTotalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-500 flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-purple-600" />
            Total Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-700">
            ${validTotalBudget.toFixed(2)}
          </div>
          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${Math.min(percentageSpent, 100)}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {percentageSpent.toFixed(1)}% allocated
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-500 flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-pink-600" />
            Total Spent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-pink-600">
            ${validTotalSpent.toFixed(2)}
          </div>
          {spendingTrend !== null && (
            <div className="mt-2 flex items-center text-sm">
              {spendingTrend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500">
                    {spendingTrend.toFixed(1)}% from last period
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">
                    {Math.abs(spendingTrend).toFixed(1)}% from last period
                  </span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-500 flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-green-600" />
            Remaining
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${validTotalRemaining.toFixed(2)}
          </div>
          <div className="mt-2 text-sm">
            {validTotalBudget > 0 ? (
              <span
                className={
                  validTotalRemaining < 0 ? "text-red-500" : "text-gray-500"
                }
              >
                {Math.abs(
                  (validTotalRemaining / validTotalBudget) * 100,
                ).toFixed(1)}
                %{validTotalRemaining < 0 ? " over budget" : " remaining"}
              </span>
            ) : (
              <span className="text-gray-500">No budget set</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetSummaryCards;
