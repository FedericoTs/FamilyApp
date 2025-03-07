-- Create family_events table
CREATE TABLE IF NOT EXISTS family_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TEXT,
  location TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('family', 'school', 'activity', 'appointment', 'other')),
  attendees TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by profile_id
CREATE INDEX IF NOT EXISTS idx_family_events_profile_id ON family_events(profile_id);

-- Add index for date-based queries
CREATE INDEX IF NOT EXISTS idx_family_events_date ON family_events(event_date);

-- Enable row-level security
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own events
DROP POLICY IF EXISTS "Users can view their own events" ON family_events;
CREATE POLICY "Users can view their own events"
  ON family_events FOR SELECT
  USING (auth.uid() = profile_id);

-- Create policy to allow users to insert their own events
DROP POLICY IF EXISTS "Users can insert their own events" ON family_events;
CREATE POLICY "Users can insert their own events"
  ON family_events FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Create policy to allow users to update their own events
DROP POLICY IF EXISTS "Users can update their own events" ON family_events;
CREATE POLICY "Users can update their own events"
  ON family_events FOR UPDATE
  USING (auth.uid() = profile_id);

-- Create policy to allow users to delete their own events
DROP POLICY IF EXISTS "Users can delete their own events" ON family_events;
CREATE POLICY "Users can delete their own events"
  ON family_events FOR DELETE
  USING (auth.uid() = profile_id);

-- Enable realtime subscriptions for this table
alter publication supabase_realtime add table family_events;
