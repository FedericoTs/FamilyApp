-- Create family_tasks table
CREATE TABLE IF NOT EXISTS family_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_to TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL CHECK (category IN ('household', 'school', 'shopping', 'personal', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE family_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own tasks
CREATE POLICY "Users can view their own tasks"
ON family_tasks
FOR SELECT
USING (profile_id = auth.uid());

-- Create policy to allow users to insert their own tasks
CREATE POLICY "Users can insert their own tasks"
ON family_tasks
FOR INSERT
WITH CHECK (profile_id = auth.uid());

-- Create policy to allow users to update their own tasks
CREATE POLICY "Users can update their own tasks"
ON family_tasks
FOR UPDATE
USING (profile_id = auth.uid());

-- Create policy to allow users to delete their own tasks
CREATE POLICY "Users can delete their own tasks"
ON family_tasks
FOR DELETE
USING (profile_id = auth.uid());

-- Add to realtime publication
alter publication supabase_realtime add table family_tasks;
