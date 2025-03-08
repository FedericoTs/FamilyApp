import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useBudget } from "@/hooks/useBudget";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit,
  PieChart,
  BarChart3,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Filter,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Clock,
  FileText,
} from "lucide-react";
import { Budget, Expense } from "@/services/budgetService";

// Import the visualization components
import BudgetChart from "./BudgetChart";
import ExpenseTimeline from "./ExpenseTimeline";
import BudgetSummaryCards from "./BudgetSummaryCards";
import BudgetExportButton from "./BudgetExportButton";
import BudgetImportButton from "./BudgetImportButton";

const FamilyBudget: React.FC = () => {
  const { toast } = useToast();
  const {
    budgets,
    expenses,
    summary,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useBudget();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date(),
    category: "groceries",
  });
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    category: "groceries",
    period: "monthly",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "week" | "month" | "year"
  >("month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.date) return;

    setIsSubmitting(true);

    try {
      const expense: Omit<Expense, "id"> = {
        title: newExpense.title,
        amount: Number(newExpense.amount),
        date: newExpense.date,
        category: newExpense.category || "groceries",
        notes: newExpense.notes,
      };

      if (newExpense.id) {
        // Update existing expense
        const result = await updateExpense(newExpense.id, expense);
        if (result.error) throw new Error(result.error);
      } else {
        // Add new expense
        const result = await addExpense(expense);
        if (result.error) throw new Error(result.error);
      }

      setNewExpense({
        date: new Date(),
        category: "groceries",
      });
      setIsAddExpenseOpen(false);

      toast({
        title: newExpense.id ? "Expense Updated" : "Expense Added",
        description: newExpense.id
          ? "Your expense has been updated successfully."
          : "Your expense has been added successfully.",
      });
    } catch (err: any) {
      console.error("Error in handleAddExpense:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save expense",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.title || !newBudget.amount) return;

    setIsSubmitting(true);

    try {
      if (newBudget.id) {
        // Update existing budget
        await updateBudget(newBudget.id, newBudget);
      } else {
        // Add new budget
        await addBudget({
          title: newBudget.title,
          amount: Number(newBudget.amount),
          category: newBudget.category || "groceries",
          period: newBudget.period || "monthly",
        });
      }

      setNewBudget({
        category: "groceries",
        period: "monthly",
      });
      setIsAddBudgetOpen(false);

      toast({
        title: newBudget.id ? "Budget Updated" : "Budget Added",
        description: newBudget.id
          ? "Your budget has been updated successfully."
          : "Your budget has been added successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save budget",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense(id);
      toast({
        title: "Expense Deleted",
        description: "The expense has been removed successfully.",
      });
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(id);
      toast({
        title: "Budget Deleted",
        description: "The budget has been removed successfully.",
      });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setNewExpense({
      ...expense,
      date: new Date(expense.date), // Ensure date is a Date object
    });
    setIsAddExpenseOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setNewBudget(budget);
    setIsAddBudgetOpen(true);
  };

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

  // Calculate totals from summary or directly from budgets if summary not available
  const totalBudget =
    summary?.totalBudget !== undefined && summary?.totalBudget !== null
      ? summary.totalBudget
      : budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0);
  const totalSpent =
    summary?.totalSpent !== undefined && summary?.totalSpent !== null
      ? summary.totalSpent
      : budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  // Use category totals from summary or calculate from budgets
  const categoryTotals =
    summary?.categoryTotals ||
    budgets.reduce(
      (acc, budget) => {
        const category = budget.category || "uncategorized";
        if (!acc[category]) {
          acc[category] = { amount: 0, spent: 0 };
        }
        acc[category].amount += Number(budget.amount) || 0;
        acc[category].spent += Number(budget.spent) || 0;
        return acc;
      },
      {} as Record<string, { amount: number; spent: number }>,
    );

  // Filter expenses based on search, date, and category
  const filteredExpenses = expenses.filter((expense) => {
    // Search filter
    if (
      searchTerm &&
      !expense.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Date filter
    const expenseDate = new Date(expense.date);
    const today = new Date();

    if (dateFilter === "week") {
      const weekStart = subDays(today, 7);
      if (expenseDate < weekStart) return false;
    } else if (dateFilter === "month") {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      if (expenseDate < monthStart || expenseDate > monthEnd) return false;
    } else if (dateFilter === "year") {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      if (expenseDate < yearStart) return false;
    }

    // Category filter
    if (categoryFilter !== "all" && expense.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  // Sort filtered expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortBy === "category") {
      return sortOrder === "asc"
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    return 0;
  });

  // Toggle sort when header is clicked
  const toggleSort = (field: "date" | "amount" | "category") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Calculate monthly spending trend
  const calculateMonthlyTrend = () => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth;
    });

    const lastMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === lastMonth;
    });

    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const lastMonthTotal = lastMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    if (lastMonthTotal === 0) return { trend: 0, isIncrease: false };

    const percentChange =
      ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    return { trend: Math.abs(percentChange), isIncrease: percentChange > 0 };
  };

  const monthlyTrend = calculateMonthlyTrend();

  // Show loading state only if we're actually loading and don't have any data yet
  if (loading && !budgets.length && !expenses.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading budget data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      {error && (
        <div
          className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg"
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <DollarSign className="h-6 w-6 text-primary mr-2" />
          Family Budget
        </h1>

        <div className="flex gap-2">
          <BudgetExportButton
            budgets={budgets}
            expenses={expenses}
            summary={summary}
          />
          <BudgetImportButton
            onImportComplete={() => {
              toast({
                title: "Data Imported",
                description: "Your budget data has been updated successfully.",
              });
            }}
          />
          <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {newBudget.id ? "Edit Budget" : "Add New Budget"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Budget Title</Label>
                  <Input
                    id="title"
                    value={newBudget.title || ""}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, title: e.target.value })
                    }
                    placeholder="Enter budget title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Budget Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newBudget.amount || ""}
                      onChange={(e) =>
                        setNewBudget({
                          ...newBudget,
                          amount: parseFloat(e.target.value),
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newBudget.category}
                      onValueChange={(value) =>
                        setNewBudget({ ...newBudget, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="groceries">Groceries</SelectItem>
                        <SelectItem value="entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="activities">Activities</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="period">Budget Period</Label>
                  <Select
                    value={newBudget.period}
                    onValueChange={(value) =>
                      setNewBudget({
                        ...newBudget,
                        period: value as "monthly" | "yearly" | "one-time",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newBudget.id && (
                  <div className="grid gap-2">
                    <Label htmlFor="spent">Amount Spent ($)</Label>
                    <Input
                      id="spent"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newBudget.spent || 0}
                      onChange={(e) =>
                        setNewBudget({
                          ...newBudget,
                          spent: parseFloat(e.target.value),
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={handleAddBudget} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {newBudget.id ? "Updating..." : "Adding..."}
                    </>
                  ) : newBudget.id ? (
                    "Update Budget"
                  ) : (
                    "Add Budget"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 space-y-6">
          {/* Summary Cards */}
          <BudgetSummaryCards
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            totalRemaining={totalRemaining}
            previousPeriodSpent={
              monthlyTrend.trend > 0
                ? totalSpent / (1 + monthlyTrend.trend / 100)
                : undefined
            }
          />

          {/* Monthly Expense Trend - Full Width */}
          <ExpenseTimeline
            expenses={expenses}
            period="month"
            title="Monthly Expense Trend"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent expenses list */}
            <Card>
              <CardHeader className="pb-2 flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  <span>Recent Transactions</span>
                </CardTitle>
                <Dialog
                  open={isAddExpenseOpen}
                  onOpenChange={setIsAddExpenseOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {newExpense.id ? "Edit Expense" : "Add New Expense"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Expense Title</Label>
                        <Input
                          id="title"
                          value={newExpense.title || ""}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              title: e.target.value,
                            })
                          }
                          placeholder="Enter expense title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Amount ($)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={newExpense.amount || ""}
                            onChange={(e) =>
                              setNewExpense({
                                ...newExpense,
                                amount: parseFloat(e.target.value),
                              })
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newExpense.category}
                            onValueChange={(value) =>
                              setNewExpense({ ...newExpense, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="groceries">
                                Groceries
                              </SelectItem>
                              <SelectItem value="entertainment">
                                Entertainment
                              </SelectItem>
                              <SelectItem value="activities">
                                Activities
                              </SelectItem>
                              <SelectItem value="education">
                                Education
                              </SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <div className="border rounded-md p-2">
                          <Calendar
                            mode="single"
                            selected={newExpense.date}
                            onSelect={(date) =>
                              date && setNewExpense({ ...newExpense, date })
                            }
                            className="rounded-md border-0 p-0"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                          id="notes"
                          value={newExpense.notes || ""}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Add any additional details"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={handleAddExpense}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {newExpense.id ? "Updating..." : "Adding..."}
                          </>
                        ) : newExpense.id ? (
                          "Update Expense"
                        ) : (
                          "Add Expense"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No expenses recorded yet.</p>
                    <Button
                      variant="link"
                      className="mt-2 text-primary"
                      onClick={() => setIsAddExpenseOpen(true)}
                    >
                      Add your first expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <div
                        key={expense.id}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-10 rounded-full ${expense.category === "groceries" ? "bg-green-500" : expense.category === "entertainment" ? "bg-purple-500" : expense.category === "activities" ? "bg-blue-500" : expense.category === "education" ? "bg-amber-500" : expense.category === "travel" ? "bg-pink-500" : "bg-red-500"}`}
                          ></div>
                          <div>
                            <h4 className="font-medium">{expense.title}</h4>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(expense.date), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${expense.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {expense.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {expenses.length > 5 && (
                  <Button
                    variant="link"
                    className="w-full mt-4 text-primary"
                    onClick={() => setActiveTab("expenses")}
                  >
                    View All Transactions
                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Budget visualization with bar chart */}
            <BudgetChart
              categoryTotals={categoryTotals}
              chartType="bar"
              title="Budget Allocation"
            />
          </div>

          {/* Budget and Expenses Summary Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-primary" />
                <span>Budget and Expenses Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">
                        Category
                      </th>
                      <th className="text-right py-3 px-2 font-medium">
                        Budget
                      </th>
                      <th className="text-right py-3 px-2 font-medium">
                        Spent
                      </th>
                      <th className="text-right py-3 px-2 font-medium">
                        Remaining
                      </th>
                      <th className="text-right py-3 px-2 font-medium">
                        % Used
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(categoryTotals).map(
                      ([category, { amount, spent }], index) => {
                        const remaining = amount - spent;
                        const percentUsed =
                          amount > 0 ? (spent / amount) * 100 : 0;
                        const isOverBudget = remaining < 0;

                        return (
                          <tr
                            key={index}
                            className="border-b last:border-0 hover:bg-muted/50"
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      category === "groceries"
                                        ? "#10b981"
                                        : category === "entertainment"
                                          ? "#8b5cf6"
                                          : category === "activities"
                                            ? "#3b82f6"
                                            : category === "education"
                                              ? "#f97316"
                                              : category === "travel"
                                                ? "#ec4899"
                                                : category === "health"
                                                  ? "#ef4444"
                                                  : "#6b7280",
                                  }}
                                />
                                <span className="capitalize">{category}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right font-medium">
                              ${amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              ${spent.toFixed(2)}
                            </td>
                            <td
                              className={`py-3 px-2 text-right font-medium ${isOverBudget ? "text-destructive" : "text-green-600"}`}
                            >
                              ${Math.abs(remaining).toFixed(2)}
                              {isOverBudget ? " over" : ""}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end">
                                <span
                                  className={
                                    percentUsed > 90
                                      ? "text-destructive font-medium"
                                      : ""
                                  }
                                >
                                  {percentUsed.toFixed(1)}%
                                </span>
                                <div className="ml-2 w-16 bg-muted rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${percentUsed > 90 ? "bg-destructive" : "bg-primary"}`}
                                    style={{
                                      width: `${Math.min(percentUsed, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                    <tr className="bg-purple-100 font-bold">
                      <td className="py-3 px-2">Total</td>
                      <td className="py-3 px-2 text-right">
                        ${totalBudget.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        ${totalSpent.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        ${totalRemaining.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {totalBudget > 0
                          ? ((totalSpent / totalBudget) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-xl flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-primary" />
                  <span>Expense Transactions</span>
                </CardTitle>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses..."
                      className="pl-8 w-full md:w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select
                    value={dateFilter}
                    onValueChange={(value: any) => setDateFilter(value)}
                  >
                    <SelectTrigger className="w-[110px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="groceries">Groceries</SelectItem>
                      <SelectItem value="entertainment">
                        Entertainment
                      </SelectItem>
                      <SelectItem value="activities">Activities</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog
                    open={isAddExpenseOpen}
                    onOpenChange={setIsAddExpenseOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Add Expense
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sortedExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-medium">
                    No expenses found
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ||
                    categoryFilter !== "all" ||
                    dateFilter !== "all"
                      ? "Try changing your filters or"
                      : "Get started by"}{" "}
                    adding a new expense.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setIsAddExpenseOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Expense
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">
                            <button
                              className="flex items-center hover:text-primary"
                              onClick={() => toggleSort("date")}
                            >
                              Date
                              <ArrowUpDown
                                className={`ml-1 h-4 w-4 ${sortBy === "date" ? "text-primary" : "text-muted-foreground"}`}
                              />
                            </button>
                          </th>
                          <th className="text-left py-3 px-2 font-medium">
                            Title
                          </th>
                          <th className="text-left py-3 px-2 font-medium">
                            <button
                              className="flex items-center hover:text-primary"
                              onClick={() => toggleSort("category")}
                            >
                              Category
                              <ArrowUpDown
                                className={`ml-1 h-4 w-4 ${sortBy === "category" ? "text-primary" : "text-muted-foreground"}`}
                              />
                            </button>
                          </th>
                          <th className="text-right py-3 px-2 font-medium">
                            <button
                              className="flex items-center ml-auto hover:text-primary"
                              onClick={() => toggleSort("amount")}
                            >
                              Amount
                              <ArrowUpDown
                                className={`ml-1 h-4 w-4 ${sortBy === "amount" ? "text-primary" : "text-muted-foreground"}`}
                              />
                            </button>
                          </th>
                          <th className="text-right py-3 px-2 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedExpenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="border-b last:border-0 hover:bg-muted/50"
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>
                                  {format(
                                    new Date(expense.date),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-medium">{expense.title}</div>
                              {expense.notes && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {expense.notes}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div
                                className={`inline-block px-2 py-0.5 rounded-full text-xs ${getCategoryColor(expense.category)}`}
                              >
                                <span className="capitalize">
                                  {expense.category}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right font-medium">
                              ${expense.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={() => handleEditExpense(expense)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() =>
                                    handleDeleteExpense(expense.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-primary" />
                  <span>Budget Categories</span>
                </CardTitle>
                <Dialog
                  open={isAddBudgetOpen}
                  onOpenChange={setIsAddBudgetOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Add Budget
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <PieChart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-medium">
                    No budgets created
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first budget to start tracking expenses.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setIsAddBudgetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Budget
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgets.map((budget) => {
                    const percentage =
                      budget.amount > 0
                        ? (budget.spent / budget.amount) * 100
                        : 0;
                    const isOverBudget = budget.spent > budget.amount;
                    return (
                      <div
                        key={budget.id}
                        className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-lg">
                              {budget.title}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="capitalize">
                                {budget.category}
                              </span>
                              <span className="mx-2">•</span>
                              <span className="capitalize">
                                {budget.period}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => handleEditBudget(budget)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-1 mt-3">
                          <div className="text-sm text-muted-foreground">
                            ${budget.spent.toFixed(2)} of $
                            {budget.amount.toFixed(2)}
                          </div>
                          <div
                            className={`text-sm font-medium ${isOverBudget ? "text-destructive" : percentage > 75 ? "text-amber-600" : "text-green-600"}`}
                          >
                            {percentage.toFixed(0)}%
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isOverBudget ? "bg-destructive" : percentage > 75 ? "bg-amber-500" : "bg-primary"}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          {isOverBudget ? (
                            <span className="text-destructive">
                              ${(budget.spent - budget.amount).toFixed(2)} over
                              budget
                            </span>
                          ) : (
                            <span className="text-green-600">
                              ${(budget.amount - budget.spent).toFixed(2)}{" "}
                              remaining
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyBudget;
