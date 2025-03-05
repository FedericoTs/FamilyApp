import React, { useState, useEffect } from "react";
import MapHeader from "./MapHeader";
import MapView from "./MapView";
import BookmarksPanel from "./BookmarksPanel";
import { getCurrentLocation } from "@/lib/googleMaps";

interface Location {
  id: string;
  name: string;
  type: string;
  position: { lat: number; lng: number };
  distance: string;
  rating: number;
  amenities: string[];
  ageRange: string;
  address: string;
  imageUrl: string;
  isBookmarked: boolean;
}

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [initialMapCenter, setInitialMapCenter] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 40.7128, lng: -74.006 }); // Default to NYC

  // Locations state - will be populated by MapView component
  const [locations, setLocations] = useState<Location[]>([]);

  // Try to get user's location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const position = await getCurrentLocation();
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        setInitialMapCenter(userPos); // Set the map center to user's location
      } catch (error) {
        console.error("Error getting initial location:", error);
        // Keep the default NYC coordinates if we can't get the user's location
      }
    };

    getUserLocation();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would filter locations or fetch new ones based on the query
    console.log(`Searching for: ${query}`);
  };

  const handleBookmarksToggle = () => {
    setShowBookmarks(!showBookmarks);
  };

  const handleLogoClick = () => {
    // Reset to initial state
    setSearchQuery("");
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <MapHeader
        onSearch={handleSearch}
        onBookmarksToggle={handleBookmarksToggle}
        onLogoClick={handleLogoClick}
      />

      <main className="flex-1 relative overflow-hidden">
        <MapView initialCenter={initialMapCenter} initialZoom={13} />

        <BookmarksPanel
          isOpen={showBookmarks}
          onClose={() => setShowBookmarks(false)}
          onSelectLocation={(location) => {
            const fullLocation = locations.find(
              (loc) => loc.id === location.id,
            );
            if (fullLocation) {
              handleLocationSelect(fullLocation);
              setShowBookmarks(false);
            }
          }}
          bookmarkedLocations={locations
            .filter((loc) => loc.isBookmarked)
            .map((loc) => ({
              id: loc.id,
              name: loc.name,
              type: loc.type,
              distance: loc.distance,
              rating: loc.rating,
              address: loc.address,
              imageUrl: loc.imageUrl,
            }))}
          onRemoveBookmark={(locationId) => {
            // In a real app, this would update the bookmark status in your database
            console.log(`Removing bookmark for location: ${locationId}`);
          }}
        />
      </main>

      <footer className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-2 text-xs">
        <p>© 2023 FamilyApp - Find family-friendly places near you</p>
      </footer>
    </div>
  );
};

export default Home;
