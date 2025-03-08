-- Fix row level security policies for family_budgets and family_expenses tables

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own budgets" ON family_budgets;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON family_expenses;

-- Create corrected insert policies
CREATE POLICY "Users can insert their own budgets"
  ON family_budgets FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own expenses"
  ON family_expenses FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
