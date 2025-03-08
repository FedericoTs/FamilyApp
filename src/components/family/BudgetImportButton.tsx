import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Budget,
  Expense,
  addBudget,
  addExpense,
} from "@/services/budgetService";

interface BudgetImportButtonProps {
  onImportComplete: () => void;
}

const BudgetImportButton: React.FC<BudgetImportButtonProps> = ({
  onImportComplete,
}) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      // Read file
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);

      // Validate import data
      if (!importData.budgets || !Array.isArray(importData.budgets)) {
        throw new Error("Invalid import file: missing budgets data");
      }

      // Import budgets
      let importedBudgets = 0;
      for (const budget of importData.budgets) {
        if (budget.title && budget.amount && budget.category && budget.period) {
          await addBudget({
            title: budget.title,
            amount: Number(budget.amount),
            category: budget.category,
            period: budget.period,
          });
          importedBudgets++;
        }
      }

      // Import expenses if available
      let importedExpenses = 0;
      if (importData.expenses && Array.isArray(importData.expenses)) {
        for (const expense of importData.expenses) {
          if (
            expense.title &&
            expense.amount &&
            expense.date &&
            expense.category
          ) {
            await addExpense({
              title: expense.title,
              amount: Number(expense.amount),
              date: new Date(expense.date),
              category: expense.category,
              notes: expense.notes,
            });
            importedExpenses++;
          }
        }
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Import Successful",
        description: `Imported ${importedBudgets} budgets and ${importedExpenses} expenses.`,
      });

      // Notify parent component that import is complete
      onImportComplete();
    } catch (error) {
      console.error("Error importing budget data:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error importing your budget data.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: "none" }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        disabled={isImporting}
        className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        {isImporting ? (
          <>
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="mr-1 h-3.5 w-3.5" />
            Import Data
          </>
        )}
      </Button>
    </>
  );
};

export default BudgetImportButton;
