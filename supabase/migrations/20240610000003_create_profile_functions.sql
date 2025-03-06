-- Create a function to create a profile bypassing RLS
CREATE OR REPLACE FUNCTION create_profile(user_id UUID, user_name TEXT, user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, username, email)
  VALUES (user_id, user_name, user_email);
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create a function to create profile settings bypassing RLS
CREATE OR REPLACE FUNCTION create_profile_settings(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profile_settings (id, color_palette, notification_enabled, location_sharing, privacy_level)
  VALUES (user_id, 'default', TRUE, 'family_only', 'standard');
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
