import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Profile, ProfileSettings, FamilyMember } from "@/types/profile";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadProfileData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // If profile doesn't exist, create it
        if (!profileData) {
          // First try to create the profile with RPC to bypass RLS
          try {
            const { data: newProfile, error: createError } = await supabase.rpc(
              "create_profile",
              {
                user_id: user.id,
                user_name: user.user_metadata?.full_name || "User",
                user_email: user.email,
              },
            );

            if (createError) throw createError;

            // Fetch the newly created profile
            const { data: fetchedProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            if (fetchError) throw fetchError;
            setProfile(fetchedProfile);
          } catch (rpcError) {
            console.error(
              "RPC error, falling back to direct insert:",
              rpcError,
            );
            // Fallback to direct insert
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                username: user.user_metadata?.full_name || "User",
                email: user.email,
              })
              .select()
              .single();

            if (createError) throw createError;
            setProfile(newProfile);
          }
        } else {
          setProfile(profileData);
        }

        // Fetch profile settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("profile_settings")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (settingsError) throw settingsError;

        // If settings don't exist, create them
        if (!settingsData) {
          // First try to create settings with RPC to bypass RLS
          try {
            const { data: newSettings, error: createSettingsError } =
              await supabase.rpc("create_profile_settings", {
                user_id: user.id,
              });

            if (createSettingsError) throw createSettingsError;

            // Fetch the newly created settings
            const { data: fetchedSettings, error: fetchError } = await supabase
              .from("profile_settings")
              .select("*")
              .eq("id", user.id)
              .single();

            if (fetchError) throw fetchError;
            setSettings(fetchedSettings);
          } catch (rpcError) {
            console.error(
              "RPC error, falling back to direct insert:",
              rpcError,
            );
            // Fallback to direct insert
            const { data: newSettings, error: createSettingsError } =
              await supabase
                .from("profile_settings")
                .insert({
                  id: user.id,
                  color_palette: "default",
                  notification_enabled: true,
                  location_sharing: "family_only",
                  privacy_level: "standard",
                })
                .select()
                .single();

            if (createSettingsError) throw createSettingsError;
            setSettings(newSettings);
          }
        } else {
          setSettings(settingsData);
        }

        // Fetch family members
        const { data: familyData, error: familyError } = await supabase
          .from("family_members")
          .select("*")
          .eq("profile_id", user.id);

        if (familyError) throw familyError;
        setFamilyMembers(familyData || []);
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return { data: null, error: error.message };
    }
  };

  const updateSettings = async (updates: Partial<ProfileSettings>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("profile_settings")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      return { data, error: null };
    } catch (error: any) {
      console.error("Error updating settings:", error);
      return { data: null, error: error.message };
    }
  };

  const addFamilyMember = async (
    newMember: Omit<
      FamilyMember,
      "id" | "profile_id" | "created_at" | "updated_at"
    >,
  ) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("family_members")
        .insert({ ...newMember, profile_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setFamilyMembers([...familyMembers, data]);
      return { data, error: null };
    } catch (error: any) {
      console.error("Error adding family member:", error);
      return { data: null, error: error.message };
    }
  };

  const updateFamilyMember = async (
    id: string,
    updates: Partial<Omit<FamilyMember, "id" | "profile_id">>,
  ) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("family_members")
        .update(updates)
        .eq("id", id)
        .eq("profile_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setFamilyMembers(
        familyMembers.map((member) => (member.id === id ? data : member)),
      );
      return { data, error: null };
    } catch (error: any) {
      console.error("Error updating family member:", error);
      return { data: null, error: error.message };
    }
  };

  const deleteFamilyMember = async (id: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", id)
        .eq("profile_id", user.id);

      if (error) throw error;
      setFamilyMembers(familyMembers.filter((member) => member.id !== id));
      return { error: null };
    } catch (error: any) {
      console.error("Error deleting family member:", error);
      return { error: error.message };
    }
  };

  return {
    profile,
    settings,
    familyMembers,
    loading,
    error,
    updateProfile,
    updateSettings,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
  };
}
