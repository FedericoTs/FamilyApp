-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  phone_number TEXT,
  main_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile settings table
CREATE TABLE IF NOT EXISTS profile_settings (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  color_palette TEXT DEFAULT 'default',
  notification_enabled BOOLEAN DEFAULT TRUE,
  location_sharing TEXT DEFAULT 'friends_only',
  privacy_level TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  age_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profile settings policies
DROP POLICY IF EXISTS "Users can view their own settings" ON profile_settings;
CREATE POLICY "Users can view their own settings"
  ON profile_settings FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own settings" ON profile_settings;
CREATE POLICY "Users can update their own settings"
  ON profile_settings FOR UPDATE
  USING (auth.uid() = id);

-- Family members policies
DROP POLICY IF EXISTS "Users can view their own family members" ON family_members;
CREATE POLICY "Users can view their own family members"
  ON family_members FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert their own family members" ON family_members;
CREATE POLICY "Users can insert their own family members"
  ON family_members FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own family members" ON family_members;
CREATE POLICY "Users can update their own family members"
  ON family_members FOR UPDATE
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete their own family members" ON family_members;
CREATE POLICY "Users can delete their own family members"
  ON family_members FOR DELETE
  USING (auth.uid() = profile_id);

-- Create triggers to automatically create profile and settings when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  
  INSERT INTO public.profile_settings (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table profile_settings;
alter publication supabase_realtime add table family_members;
