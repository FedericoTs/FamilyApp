-- Create saved_locations table
CREATE TABLE IF NOT EXISTS saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  rating FLOAT,
  amenities TEXT[],
  age_range TEXT,
  address TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- Enable RLS
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own saved locations" ON saved_locations;
CREATE POLICY "Users can view their own saved locations"
  ON saved_locations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved locations" ON saved_locations;
CREATE POLICY "Users can insert their own saved locations"
  ON saved_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved locations" ON saved_locations;
CREATE POLICY "Users can update their own saved locations"
  ON saved_locations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved locations" ON saved_locations;
CREATE POLICY "Users can delete their own saved locations"
  ON saved_locations FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table saved_locations;
