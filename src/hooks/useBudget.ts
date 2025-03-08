import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Budget,
  Expense,
  fetchBudgets,
  fetchExpenses,
  addBudget,
  updateBudget,
  deleteBudget,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
  createBudgetAlert,
} from "@/services/budgetService";
import { supabase } from "@/lib/supabase";

export function useBudget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<{
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    categoryTotals: Record<string, { amount: number; spent: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load budgets and expenses
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const loadBudgetData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch budgets
        const budgetsResult = await fetchBudgets();
        if (budgetsResult.error) throw new Error(budgetsResult.error);
        if (isMounted) setBudgets(budgetsResult.data || []);

        // Fetch expenses
        const expensesResult = await fetchExpenses();
        if (expensesResult.error) throw new Error(expensesResult.error);

        // Convert date strings to Date objects
        const formattedExpenses = (expensesResult.data || []).map(
          (expense) => ({
            ...expense,
            date: new Date(expense.date),
          }),
        );
        if (isMounted) setExpenses(formattedExpenses);

        // Get budget summary
        const summaryResult = await getBudgetSummary();
        if (summaryResult.error) throw new Error(summaryResult.error);
        if (isMounted) setSummary(summaryResult.data);
      } catch (err: any) {
        console.error("Error loading budget data:", err);
        if (isMounted) {
          setError(err.message);
          toast({
            variant: "destructive",
            title: "Error loading budget data",
            description: "Failed to load your budget information.",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBudgetData();

    // Set up realtime subscriptions with debounce for updates
    let debounceTimer: NodeJS.Timeout;
    const handleRealtimeUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (isMounted) loadBudgetData();
      }, 300); // Debounce updates by 300ms
    };

    const budgetsSubscription = supabase
      .channel("budget_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "family_budgets" },
        handleRealtimeUpdate,
      )
      .subscribe();

    const expensesSubscription = supabase
      .channel("expense_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "family_expenses" },
        handleRealtimeUpdate,
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
      budgetsSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, [user, toast]);

  // Add a new budget
  const handleAddBudget = async (newBudget: Omit<Budget, "id" | "spent">) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const result = await addBudget(newBudget);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Budget Added",
        description: `${newBudget.title} budget has been added successfully.`,
      });

      return { data: result.data, error: null };
    } catch (err: any) {
      console.error("Error adding budget:", err);
      toast({
        variant: "destructive",
        title: "Error adding budget",
        description: err.message,
      });
      return { data: null, error: err.message };
    }
  };

  // Update an existing budget
  const handleUpdateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const result = await updateBudget(id, updates);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Budget Updated",
        description: "Budget has been updated successfully.",
      });

      return { data: result.data, error: null };
    } catch (err: any) {
      console.error("Error updating budget:", err);
      toast({
        variant: "destructive",
        title: "Error updating budget",
        description: err.message,
      });
      return { data: null, error: err.message };
    }
  };

  // Delete a budget
  const handleDeleteBudget = async (id: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const result = await deleteBudget(id);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Budget Deleted",
        description: "Budget has been removed successfully.",
      });

      return { error: null };
    } catch (err: any) {
      console.error("Error deleting budget:", err);
      toast({
        variant: "destructive",
        title: "Error deleting budget",
        description: err.message,
      });
      return { error: err.message };
    }
  };

  // Add a new expense
  const handleAddExpense = async (newExpense: Omit<Expense, "id">) => {
    if (!user) return { error: "Not authenticated" };

    try {
      console.log("Adding expense:", newExpense);
      const result = await addExpense(newExpense);
      console.log("Add expense result:", result);

      if (result.error) throw new Error(result.error);

      toast({
        title: "Expense Added",
        description: `${newExpense.title} expense has been added successfully.`,
      });

      // Check if we need to create a budget alert
      if (summary) {
        const category = newExpense.category;
        if (summary.categoryTotals[category]) {
          const { amount, spent } = summary.categoryTotals[category];
          const updatedSpent = spent + newExpense.amount;
          const percentage = Math.round((updatedSpent / amount) * 100);

          // Create alerts at 75% and 90% thresholds
          if (percentage >= 90 || (percentage >= 75 && spent < amount * 0.75)) {
            await createBudgetAlert(user.id, category, percentage);
          }
        }
      }

      return { data: result.data, error: null };
    } catch (err: any) {
      console.error("Error adding expense:", err);
      toast({
        variant: "destructive",
        title: "Error adding expense",
        description: err.message,
      });
      return { data: null, error: err.message };
    }
  };

  // Update an existing expense
  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const result = await updateExpense(id, updates);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Expense Updated",
        description: "Expense has been updated successfully.",
      });

      return { data: result.data, error: null };
    } catch (err: any) {
      console.error("Error updating expense:", err);
      toast({
        variant: "destructive",
        title: "Error updating expense",
        description: err.message,
      });
      return { data: null, error: err.message };
    }
  };

  // Delete an expense
  const handleDeleteExpense = async (id: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const result = await deleteExpense(id);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Expense Deleted",
        description: "Expense has been removed successfully.",
      });

      return { error: null };
    } catch (err: any) {
      console.error("Error deleting expense:", err);
      toast({
        variant: "destructive",
        title: "Error deleting expense",
        description: err.message,
      });
      return { error: err.message };
    }
  };

  return {
    budgets,
    expenses,
    summary,
    loading,
    error,
    addBudget: handleAddBudget,
    updateBudget: handleUpdateBudget,
    deleteBudget: handleDeleteBudget,
    addExpense: handleAddExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
  };
}
