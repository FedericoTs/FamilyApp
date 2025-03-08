-- Add sample budget data if none exists
INSERT INTO family_budgets (profile_id, title, amount, spent, category, period)
SELECT 
  auth.uid() as profile_id,
  'Groceries' as title,
  500 as amount,
  320 as spent,
  'groceries' as category,
  'monthly' as period
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM family_budgets WHERE profile_id = auth.uid() AND category = 'groceries')
LIMIT 1;

INSERT INTO family_budgets (profile_id, title, amount, spent, category, period)
SELECT 
  auth.uid() as profile_id,
  'Entertainment' as title,
  200 as amount,
  150 as spent,
  'entertainment' as category,
  'monthly' as period
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM family_budgets WHERE profile_id = auth.uid() AND category = 'entertainment')
LIMIT 1;

INSERT INTO family_budgets (profile_id, title, amount, spent, category, period)
SELECT 
  auth.uid() as profile_id,
  'Activities' as title,
  300 as amount,
  180 as spent,
  'activities' as category,
  'monthly' as period
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM family_budgets WHERE profile_id = auth.uid() AND category = 'activities')
LIMIT 1;

-- Add sample expense data if none exists
INSERT INTO family_expenses (profile_id, title, amount, date, category, notes)
SELECT 
  auth.uid() as profile_id,
  'Weekly Grocery Shopping' as title,
  120 as amount,
  (CURRENT_DATE - INTERVAL '5 days')::text as date,
  'groceries' as category,
  'Regular weekly shopping' as notes
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM family_expenses WHERE profile_id = auth.uid())
LIMIT 1;

INSERT INTO family_expenses (profile_id, title, amount, date, category, notes)
SELECT 
  auth.uid() as profile_id,
  'Movie Tickets' as title,
  45 as amount,
  (CURRENT_DATE - INTERVAL '3 days')::text as date,
  'entertainment' as category,
  'Family movie night' as notes
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM family_expenses WHERE profile_id = auth.uid() AND category = 'entertainment')
LIMIT 1;

INSERT INTO family_expenses (profile_id, title, amount, date, category, notes)
SELECT 
  auth.uid() as profile_id,
  'Swimming Lessons' as title,
  60 as amount,
  (CURRENT_DATE - INTERVAL '1 day')::text as date,
  'activities' as category,
  'Monthly swimming class' as notes
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM family_expenses WHERE profile_id = auth.uid() AND category = 'activities')
LIMIT 1;
