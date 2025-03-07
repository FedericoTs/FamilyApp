import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { SavedLocation } from "@/types/location";
import { Location } from "@/types/location";

export function useSavedLocations() {
  const { user } = useAuth();
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved locations when user is authenticated
  useEffect(() => {
    if (!user) {
      setSavedLocations([]);
      setLoading(false);
      return;
    }

    const loadSavedLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("saved_locations")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSavedLocations(data || []);
      } catch (err: any) {
        console.error("Error loading saved locations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSavedLocations();

    // Subscribe to changes
    const subscription = supabase
      .channel("saved_locations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "saved_locations" },
        loadSavedLocations,
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Save a location
  const saveLocation = async (location: Location) => {
    if (!user) return { error: "Not authenticated" };

    try {
      // Check if location is already saved
      const { data: existingLocation } = await supabase
        .from("saved_locations")
        .select("id")
        .eq("user_id", user.id)
        .eq("location_id", location.id)
        .single();

      if (existingLocation) {
        // Location already saved, return success
        return { data: existingLocation, error: null };
      }

      // Save new location
      const { data, error } = await supabase
        .from("saved_locations")
        .insert({
          user_id: user.id,
          location_id: location.id,
          name: location.name,
          type: location.type,
          lat: location.position.lat,
          lng: location.position.lng,
          rating: location.rating,
          amenities: location.amenities,
          age_range: location.ageRange,
          address: location.address,
          image_url: location.imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error("Error saving location:", error);
      return { data: null, error: error.message };
    }
  };

  // Remove a saved location
  const removeSavedLocation = async (locationId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      // First find the saved location record by location_id
      const { data: savedLocationRecords, error: findError } = await supabase
        .from("saved_locations")
        .select("id")
        .eq("user_id", user.id)
        .eq("location_id", locationId);

      if (findError) throw findError;

      // If no record found by location_id, try matching by name
      if (!savedLocationRecords || savedLocationRecords.length === 0) {
        const formattedId = locationId.toLowerCase();
        const { data: locations } = await supabase
          .from("saved_locations")
          .select("id, name")
          .eq("user_id", user.id);

        // Find by matching the formatted name
        const matchedLocation = locations?.find(
          (loc) => loc.name.replace(/\s+/g, "-").toLowerCase() === formattedId,
        );

        if (matchedLocation) {
          // Delete the found record
          const { error } = await supabase
            .from("saved_locations")
            .delete()
            .eq("id", matchedLocation.id);

          if (error) throw error;
          return { success: true, error: null };
        }

        return {
          success: false,
          error: "Location not found in saved locations",
        };
      }

      // Delete all matching records (in case there are duplicates)
      const recordIds = savedLocationRecords.map((record) => record.id);
      const { error } = await supabase
        .from("saved_locations")
        .delete()
        .in("id", recordIds);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error removing saved location:", error);
      return { success: false, error: error.message };
    }
  };

  // Check if a location is saved
  const isLocationSaved = (locationId: string): boolean => {
    // This will be called on every render to check if a location is saved in the database
    return savedLocations.some(
      (loc) =>
        loc.location_id === locationId ||
        loc.name.replace(/\s+/g, "-").toLowerCase() ===
          locationId.toLowerCase(),
    );
  };

  // Convert SavedLocation to Location format
  const convertToLocationFormat = (savedLocation: SavedLocation): Location => {
    return {
      id: savedLocation.location_id,
      name: savedLocation.name,
      type: savedLocation.type,
      position: { lat: savedLocation.lat, lng: savedLocation.lng },
      rating: savedLocation.rating,
      amenities: savedLocation.amenities || [],
      ageRange: savedLocation.age_range || "All ages",
      address: savedLocation.address || "",
      imageUrl: savedLocation.image_url || "",
      isBookmarked: true,
    };
  };

  // Get all saved locations in Location format
  const getSavedLocationsForMap = (): Location[] => {
    return savedLocations.map(convertToLocationFormat);
  };

  return {
    savedLocations,
    loading,
    error,
    saveLocation,
    removeSavedLocation,
    isLocationSaved,
    getSavedLocationsForMap,
    convertToLocationFormat,
  };
}
