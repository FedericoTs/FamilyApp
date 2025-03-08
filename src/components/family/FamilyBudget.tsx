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
import { format } from "date-fns";
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
} from "lucide-react";
import { Budget, Expense } from "@/services/budgetService";

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

  const [activeTab, setActiveTab] = useState("overview");
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

      console.log("Submitting expense:", expense);

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
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(id);
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
    summary?.totalBudget ||
    budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent =
    summary?.totalSpent ||
    budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Use category totals from summary or calculate from budgets
  const categoryTotals =
    summary?.categoryTotals ||
    budgets.reduce(
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

  if (loading && !budgets.length && !expenses.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-2" />
        <span>Loading budget data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Add Expense
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
                      setNewExpense({ ...newExpense, title: e.target.value })
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
                      setNewExpense({ ...newExpense, notes: e.target.value })
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
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
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

          <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 w-full sm:w-auto">
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
                <Button
                  onClick={handleAddBudget}
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                  disabled={isSubmitting}
                >
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

      <TabsContent value="overview" className="mt-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-500">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                ${totalBudget.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-500">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                ${totalSpent.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-500">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${totalRemaining.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-purple-600" />
              <span>Budget Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryTotals).length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No budget categories defined yet.</p>
                <Button
                  variant="link"
                  className="text-purple-600"
                  onClick={() => setIsAddBudgetOpen(true)}
                >
                  Add your first budget
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(categoryTotals).map(
                  ([category, { amount, spent }]) => {
                    const percentage = amount > 0 ? (spent / amount) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(category).split(" ")[0]}`}
                            ></div>
                            <span className="capitalize">{category}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            ${spent.toFixed(2)} / ${amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${percentage > 90 ? "bg-red-600" : "bg-gradient-to-r from-pink-500 to-purple-600"}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-pink-600" />
              <span>Recent Expenses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No expenses recorded yet.</p>
                <Button
                  variant="link"
                  className="text-purple-600"
                  onClick={() => setIsAddExpenseOpen(true)}
                >
                  Add your first expense
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <h4 className="font-medium">{expense.title}</h4>
                      <div className="flex items-center mt-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500">
                          {format(new Date(expense.date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(expense.category)}`}
                      >
                        <span className="capitalize">{expense.category}</span>
                      </div>
                      <span className="font-medium">
                        ${expense.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {expenses.length > 5 && (
              <Button
                variant="link"
                className="w-full mt-4 text-purple-600"
                onClick={() => setActiveTab("expenses")}
              >
                View All Expenses
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="expenses" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-pink-600" />
              <span>Expense Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No expenses recorded
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add your first expense to start tracking.
                </p>
                <div className="mt-6">
                  <Dialog
                    open={isAddExpenseOpen}
                    onOpenChange={setIsAddExpenseOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
                        <Plus className="h-4 w-4 mr-2" /> Add Expense
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">
                          Title
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Date
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Category
                        </th>
                        <th className="text-right py-3 px-2 font-medium">
                          Amount
                        </th>
                        <th className="text-right py-3 px-2 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-3 px-2">{expense.title}</td>
                          <td className="py-3 px-2">
                            {format(new Date(expense.date), "MMM d, yyyy")}
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
                                className="h-8 w-8 text-gray-500 hover:text-purple-600"
                                onClick={() => handleEditExpense(expense)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                onClick={() => handleDeleteExpense(expense.id)}
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
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-purple-600" />
              <span>Budget Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <div className="text-center py-12">
                <PieChart className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No budgets created
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create your first budget to start tracking expenses.
                </p>
                <div className="mt-6">
                  <Dialog
                    open={isAddBudgetOpen}
                    onOpenChange={setIsAddBudgetOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
                        <Plus className="h-4 w-4 mr-2" /> Add Budget
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {budgets.map((budget) => {
                  const percentage =
                    budget.amount > 0
                      ? (budget.spent / budget.amount) * 100
                      : 0;
                  return (
                    <div
                      key={budget.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-lg">
                            {budget.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="capitalize">
                              {budget.category}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{budget.period}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-purple-600"
                            onClick={() => handleEditBudget(budget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-500">
                          ${budget.spent.toFixed(2)} of $
                          {budget.amount.toFixed(2)}
                        </div>
                        <div className="text-sm font-medium">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${percentage > 90 ? "bg-red-600" : percentage > 75 ? "bg-amber-500" : "bg-gradient-to-r from-pink-500 to-purple-600"}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default FamilyBudget;
