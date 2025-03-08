import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BudgetExportButtonProps {
  budgets: any[];
  expenses: any[];
  summary: any;
}

const BudgetExportButton: React.FC<BudgetExportButtonProps> = ({
  budgets,
  expenses,
  summary,
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Create export data
      const exportData = {
        summary: summary || {
          totalBudget: budgets.reduce((sum, budget) => sum + budget.amount, 0),
          totalSpent: budgets.reduce((sum, budget) => sum + budget.spent, 0),
          totalRemaining: budgets.reduce(
            (sum, budget) => sum + budget.amount - budget.spent,
            0,
          ),
        },
        budgets,
        expenses: expenses.map((expense) => ({
          ...expense,
          date:
            expense.date instanceof Date
              ? expense.date.toISOString()
              : expense.date,
        })),
        exportDate: new Date().toISOString(),
      };

      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `family_budget_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your budget data has been exported successfully.",
      });
    } catch (error) {
      console.error("Error exporting budget data:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error exporting your budget data.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-1 h-3.5 w-3.5" />
          Export Data
        </>
      )}
    </Button>
  );
};

export default BudgetExportButton;
