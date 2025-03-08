import { supabase } from "@/lib/supabase";

export interface Budget {
  id: string;
  title: string;
  amount: number;
  spent: number;
  category: string;
  period: "monthly" | "yearly" | "one-time";
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category: string;
  notes?: string;
}

// Fetch all budgets for the current user
export const fetchBudgets = async () => {
  try {
    const { data, error } = await supabase
      .from("family_budgets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching budgets:", error);
    return { data: null, error: error.message };
  }
};

// Add a new budget
export const addBudget = async (budget: Omit<Budget, "id" | "spent">) => {
  try {
    // Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("family_budgets")
      .insert({
        profile_id: user.id, // Add the profile_id
        title: budget.title,
        amount: budget.amount,
        spent: 0, // Initialize spent amount to 0
        category: budget.category,
        period: budget.period,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error adding budget:", error);
    return { data: null, error: error.message };
  }
};

// Update an existing budget
export const updateBudget = async (id: string, updates: Partial<Budget>) => {
  try {
    const { data, error } = await supabase
      .from("family_budgets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating budget:", error);
    return { data: null, error: error.message };
  }
};

// Delete a budget
export const deleteBudget = async (id: string) => {
  try {
    const { error } = await supabase
      .from("family_budgets")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error deleting budget:", error);
    return { error: error.message };
  }
};

// Fetch all expenses for the current user
export const fetchExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from("family_expenses")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return { data: null, error: error.message };
  }
};

// Update budget spent amount when an expense is added
export const updateBudgetSpent = async (category: string, amount: number) => {
  try {
    // Get all budgets for this category
    const { data, error } = await supabase
      .from("family_budgets")
      .select("*")
      .eq("category", category);

    if (error) throw error;

    // Update each budget's spent amount
    for (const budget of data || []) {
      const newSpent = budget.spent + amount;
      const { error: updateError } = await supabase
        .from("family_budgets")
        .update({ spent: newSpent })
        .eq("id", budget.id);

      if (updateError) throw updateError;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error updating budget spent:", error);
    return { success: false, error: error.message };
  }
};

// This function is called after adding an expense to update the corresponding budget
export const updateBudgetAfterExpense = async (
  expense: Omit<Expense, "id">,
) => {
  try {
    await updateBudgetSpent(expense.category, expense.amount);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error updating budget after expense:", error);
    return { success: false, error: error.message };
  }
};

// Add a new expense
export const addExpense = async (expense: Omit<Expense, "id">) => {
  try {
    // Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("Adding expense with user ID:", user.id);

    const { data, error } = await supabase
      .from("family_expenses")
      .insert({
        profile_id: user.id, // Add the profile_id
        title: expense.title,
        amount: expense.amount,
        date: expense.date.toISOString(),
        category: expense.category,
        notes: expense.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding expense:", error);
      throw error;
    }

    // Update the corresponding budget's spent amount
    await updateBudgetAfterExpense(expense);

    return { data, error: null };
  } catch (error: any) {
    console.error("Error adding expense:", error);
    return { data: null, error: error.message };
  }
};

// Update an existing expense
export const updateExpense = async (id: string, updates: Partial<Expense>) => {
  try {
    // Convert Date object to ISO string if present
    const formattedUpdates = { ...updates };
    if (updates.date instanceof Date) {
      formattedUpdates.date = updates.date.toISOString();
    }

    const { data, error } = await supabase
      .from("family_expenses")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating expense:", error);
    return { data: null, error: error.message };
  }
};

// Delete an expense
export const deleteExpense = async (id: string) => {
  try {
    const { error } = await supabase
      .from("family_expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return { error: error.message };
  }
};

// Get budget summary statistics
export const getBudgetSummary = async () => {
  try {
    const { data, error } = await supabase
      .from("family_budgets")
      .select("amount, spent, category")
      .order("category");

    if (error) throw error;

    // Calculate totals and category breakdowns
    const totalBudget = data.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = data.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    // Group by category
    const categoryTotals = data.reduce(
      (acc, budget) => {
        if (!acc[budget.category]) {
          acc[budget.category] = { amount: 0, spent: 0 };
        }
        acc[budget.category].amount += budget.amount;
        acc[budget.category].spent += budget.spent;
        return acc;
      },
      {} as Record<string, { amount: number; spent: number }>,
    );

    return {
      data: {
        totalBudget,
        totalSpent,
        totalRemaining,
        categoryTotals,
      },
      error: null,
    };
  } catch (error: any) {
    console.error("Error getting budget summary:", error);
    return { data: null, error: error.message };
  }
};

// Create budget notification when spending exceeds threshold
export const createBudgetAlert = async (
  userId: string,
  category: string,
  percentage: number,
) => {
  try {
    const { error } = await supabase.from("notifications").insert({
      profile_id: userId,
      title: "Budget Alert",
      message: `You've used ${percentage}% of your ${category} budget.`,
      type: percentage > 90 ? "alert" : "info",
      category: "budget",
      read: false,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error creating budget alert:", error);
    return { error: error.message };
  }
};
