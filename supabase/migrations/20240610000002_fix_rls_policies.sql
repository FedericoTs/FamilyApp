-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Fix RLS policies for profile_settings table
DROP POLICY IF EXISTS "Users can view their own settings" ON profile_settings;
CREATE POLICY "Users can view their own settings"
  ON profile_settings FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON profile_settings;
CREATE POLICY "Users can insert their own settings"
  ON profile_settings FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own settings" ON profile_settings;
CREATE POLICY "Users can update their own settings"
  ON profile_settings FOR UPDATE
  USING (auth.uid() = id);
