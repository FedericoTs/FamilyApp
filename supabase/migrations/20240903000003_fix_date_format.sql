-- Fix sample budget data insertion to properly handle date format

-- Create a function to safely insert sample data with proper date format
CREATE OR REPLACE FUNCTION insert_sample_budget_data_fixed()
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get a user ID from the auth.users table
  SELECT id INTO user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we have a user
  IF user_id IS NOT NULL THEN
    -- Insert sample budget data if none exists for this user
    INSERT INTO family_budgets (profile_id, title, amount, spent, category, period)
    SELECT 
      user_id,
      'Groceries',
      500,
      320,
      'groceries',
      'monthly'
    WHERE NOT EXISTS (SELECT 1 FROM family_budgets WHERE profile_id = user_id AND category = 'groceries');

    INSERT INTO family_budgets (profile_id, title, amount, spent, category, period)
    SELECT 
      user_id,
      'Entertainment',
      200,
      150,
      'entertainment',
      'monthly'
    WHERE NOT EXISTS (SELECT 1 FROM family_budgets WHERE profile_id = user_id AND category = 'entertainment');

    INSERT INTO family_budgets (profile_id, title, amount, spent, category, period)
    SELECT 
      user_id,
      'Activities',
      300,
      180,
      'activities',
      'monthly'
    WHERE NOT EXISTS (SELECT 1 FROM family_budgets WHERE profile_id = user_id AND category = 'activities');

    -- Insert sample expense data if none exists for this user
    -- Fix: Cast date to timestamp with time zone instead of text
    INSERT INTO family_expenses (profile_id, title, amount, date, category, notes)
    SELECT 
      user_id,
      'Weekly Grocery Shopping',
      120,
      (CURRENT_DATE - INTERVAL '5 days')::timestamp with time zone,
      'groceries',
      'Regular weekly shopping'
    WHERE NOT EXISTS (SELECT 1 FROM family_expenses WHERE profile_id = user_id);

    INSERT INTO family_expenses (profile_id, title, amount, date, category, notes)
    SELECT 
      user_id,
      'Movie Tickets',
      45,
      (CURRENT_DATE - INTERVAL '3 days')::timestamp with time zone,
      'entertainment',
      'Family movie night'
    WHERE NOT EXISTS (SELECT 1 FROM family_expenses WHERE profile_id = user_id AND category = 'entertainment');

    INSERT INTO family_expenses (profile_id, title, amount, date, category, notes)
    SELECT 
      user_id,
      'Swimming Lessons',
      60,
      (CURRENT_DATE - INTERVAL '1 day')::timestamp with time zone,
      'activities',
      'Monthly swimming class'
    WHERE NOT EXISTS (SELECT 1 FROM family_expenses WHERE profile_id = user_id AND category = 'activities');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT insert_sample_budget_data_fixed();

-- Drop the function after use
DROP FUNCTION insert_sample_budget_data_fixed();
