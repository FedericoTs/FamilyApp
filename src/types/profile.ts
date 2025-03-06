export interface Profile {
  id: string;
  username: string;
  email: string;
  phone_number: string | null;
  main_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileSettings {
  id: string;
  color_palette: string;
  notification_enabled: boolean;
  location_sharing: "friends_only" | "family_only" | "everyone" | "none";
  privacy_level: "standard" | "high" | "low";
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  profile_id: string;
  name: string;
  relationship: string | null;
  age_range: string | null;
  created_at: string;
  updated_at: string;
}
