-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'alert', 'info')),
  category TEXT NOT NULL CHECK (category IN ('calendar', 'budget', 'family', 'system')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by profile_id
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);

-- Add index for read status
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable row-level security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = profile_id);

-- Create policy to allow users to insert their own notifications
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Create policy to allow users to update their own notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = profile_id);

-- Create policy to allow users to delete their own notifications
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = profile_id);

-- Enable realtime subscriptions for this table
alter publication supabase_realtime add table notifications;
