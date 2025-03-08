-- Create family_budgets table
CREATE TABLE IF NOT EXISTS family_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  spent DECIMAL(10, 2) DEFAULT 0,
  category TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly', 'one-time')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_expenses table
CREATE TABLE IF NOT EXISTS family_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE family_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for family_budgets
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

-- Create policies for family_expenses
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

-- Add realtime support
alter publication supabase_realtime add table family_budgets;
alter publication supabase_realtime add table family_expenses;

-- Create function to update budget spent amount when expenses are added/updated/deleted
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the spent amount in the corresponding budget category
  IF TG_OP = 'INSERT' THEN
    -- When a new expense is added
    UPDATE family_budgets
    SET spent = spent + NEW.amount,
        updated_at = NOW()
    WHERE profile_id = NEW.profile_id AND category = NEW.category;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- When an expense is updated
    -- First subtract the old amount
    UPDATE family_budgets
    SET spent = spent - OLD.amount,
        updated_at = NOW()
    WHERE profile_id = OLD.profile_id AND category = OLD.category;
    
    -- Then add the new amount (possibly to a different category)
    UPDATE family_budgets
    SET spent = spent + NEW.amount,
        updated_at = NOW()
    WHERE profile_id = NEW.profile_id AND category = NEW.category;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- When an expense is deleted
    UPDATE family_budgets
    SET spent = GREATEST(0, spent - OLD.amount),
        updated_at = NOW()
    WHERE profile_id = OLD.profile_id AND category = OLD.category;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update budget spent amount
CREATE TRIGGER expense_insert_trigger
AFTER INSERT ON family_expenses
FOR EACH ROW
EXECUTE FUNCTION update_budget_spent();

CREATE TRIGGER expense_update_trigger
AFTER UPDATE ON family_expenses
FOR EACH ROW
EXECUTE FUNCTION update_budget_spent();

CREATE TRIGGER expense_delete_trigger
AFTER DELETE ON family_expenses
FOR EACH ROW
EXECUTE FUNCTION update_budget_spent();
