-- Drop all existing policies for family_budgets and family_expenses
DROP POLICY IF EXISTS "Users can view their own budgets" ON family_budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON family_budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON family_budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON family_budgets;

DROP POLICY IF EXISTS "Users can view their own expenses" ON family_expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON family_expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON family_expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON family_expenses;

-- Temporarily disable RLS to fix the issue
ALTER TABLE family_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_expenses DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE family_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_expenses ENABLE ROW LEVEL SECURITY;

-- Create new policies with correct syntax
CREATE POLICY "Users can view their own budgets"
  ON family_budgets FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own budgets"
  ON family_budgets FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own budgets"
  ON family_budgets FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own budgets"
  ON family_budgets FOR DELETE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can view their own expenses"
  ON family_expenses FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own expenses"
  ON family_expenses FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own expenses"
  ON family_expenses FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own expenses"
  ON family_expenses FOR DELETE
  USING (auth.uid() = profile_id);
