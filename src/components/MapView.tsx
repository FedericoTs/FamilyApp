import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Layers,
  Plus,
  Minus,
  Compass,
  AlertCircle,
  Search,
  Loader2,
  X,
  Coffee,
  Library,
  TreePine,
  Palmtree,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import FilterPanel from "./FilterPanel";
import LocationCard from "./LocationCard";
import LocationCarousel from "./LocationCarousel";
import BookmarksPanel from "./BookmarksPanel";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import {
  googleMapsApiKey,
  defaultMapOptions,
  getCurrentLocation,
} from "@/lib/googleMaps";
import {
  searchNearby,
  transformPlacesResponse,
  calculateDistance,
  kmToMiles,
} from "@/lib/placesApi";

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

interface MapViewProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

const MapView = ({
  initialCenter = { lat: 40.7128, lng: -74.006 }, // New York City coordinates
  initialZoom = 18,
}: MapViewProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkedLocations, setBookmarkedLocations] = useState<Location[]>(
    [],
  );
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [center, setCenter] = useState(initialCenter);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
    libraries: ["places"],
  });

  // Mock locations data
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // Initialize with default locations and fetch nearby places when user location is available
  useEffect(() => {
    const initialBookmarks = locations.filter(
      (location) => location.isBookmarked,
    );
    setBookmarkedLocations(initialBookmarks);
  }, [locations]);

  // Fetch nearby places when user location is available
  useEffect(() => {
    if (userLocation && isLoaded) {
      fetchNearbyPlaces(userLocation);
    }
  }, [userLocation, isLoaded]);

  // Get user's current location
  useEffect(() => {
    if (isLoaded) {
      getUserLocation();
    }
  }, [isLoaded]);

  // Listen for category filter events
  useEffect(() => {
    const mapViewElement = document.getElementById("map-view");
    if (!mapViewElement) return;

    const handleFilterByCategory = (event: any) => {
      const { category } = event.detail;
      if (userLocation) {
        // Map category names to location types for filtering
        const categoryFilters = {
          locationTypes: [category],
        };
        fetchNearbyPlaces(userLocation, categoryFilters);
      }
    };

    mapViewElement.addEventListener("filterByCategory", handleFilterByCategory);

    return () => {
      mapViewElement.removeEventListener(
        "filterByCategory",
        handleFilterByCategory,
      );
    };
  }, [userLocation]);

  const getUserLocation = useCallback(async () => {
    try {
      setLocationError(null);
      const position = await getCurrentLocation();
      const userPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(userPos);
      setCenter(userPos);

      // If we have a map reference, pan to the user's location
      if (mapRef.current) {
        mapRef.current.panTo(userPos);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError(
        "Unable to access your location. Please enable location services in your browser settings.",
      );
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setCenter(location.position);
    setActiveMarker(location.id);
    // Don't show InfoWindow when selecting from bookmarks or location card
    setShowInfoWindow(false);

    // Pan to the selected location
    if (mapRef.current) {
      mapRef.current.panTo(location.position);
    }
  };

  const handleMarkerClick = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
      setActiveMarker(locationId);
      // No longer showing InfoWindow
      setShowInfoWindow(false);

      // Pan to the selected location
      if (mapRef.current) {
        mapRef.current.panTo(location.position);
      }
    }
  };

  // InfoWindow has been removed, but keeping this function for future reference
  const handleInfoWindowClose = () => {
    setShowInfoWindow(false);
    setActiveMarker(null);
  };

  const handleBookmarkToggle = (location: Location) => {
    const updatedLocation = {
      ...location,
      isBookmarked: !location.isBookmarked,
    };

    // In a real app, you would update this in your database
    // For now, we'll just update our local state
    if (updatedLocation.isBookmarked) {
      setBookmarkedLocations([...bookmarkedLocations, updatedLocation]);
    } else {
      setBookmarkedLocations(
        bookmarkedLocations.filter((loc) => loc.id !== location.id),
      );
    }

    // If the selected location is being updated, update it too
    if (selectedLocation && selectedLocation.id === location.id) {
      setSelectedLocation(updatedLocation);
    }
  };

  const handleGetDirections = (location: Location) => {
    // Open directions in Google Maps
    window.open(`https://maps.google.com/?q=${location.address}`, "_blank");
  };

  const handleZoomIn = () => {
    const newZoom = Math.min((mapZoom || 13) + 1, 20); // Max zoom level
    setMapZoom(newZoom);
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max((mapZoom || 13) - 1, 1); // Min zoom level
    setMapZoom(newZoom);
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom);
    }
  };

  const fetchNearbyPlaces = async (
    location: { lat: number; lng: number },
    filters?: any,
  ) => {
    if (!googleMapsApiKey) {
      setPlacesError("Google Maps API key is missing");
      return;
    }

    setIsLoadingPlaces(true);
    setPlacesError(null);

    try {
      // Determine place types based on filters
      let placeTypes = [
        "park",
        "amusement_park",
        "museum",
        "restaurant",
        "library",
        "aquarium",
        "zoo",
        "cafe",
        "movie_theater",
        "bowling_alley",
        "art_gallery",
        "shopping_mall",
        "spa",
        "gym",
        "tourist_attraction",
        "meal_delivery",
        "meal_takeaway",
        "bakery",
        "store",
        "shoe_store",
        "convenience_store",
        "clothing_store",
        "department_store",
        "pharmacy",
        "supermarket",
      ];

      if (filters?.locationTypes && filters.locationTypes.length > 0) {
        // Map UI filter categories to Google Places API types
        const typeMapping: Record<string, string[]> = {
          Parks: ["park", "zoo"],
          Playgrounds: ["park", "zoo"],
          "Kid-Friendly Restaurants": [
            "restaurant",
            "meal_delivery",
            "meal_takeaway",
            "bakery",
          ],
          Restaurants: [
            "restaurant",
            "meal_delivery",
            "meal_takeaway",
            "bakery",
          ],
          Cafés: ["cafe", "bakery"],
          Museums: ["museum", "art_gallery"],
          "Children's Museums": ["museum", "art_gallery"],
          Libraries: ["library"],
          Indoor: [
            "movie_theater",
            "bowling_alley",
            "aquarium",
            "museum",
            "shopping_mall",
            "spa",
            "gym",
            "zoo",
          ],
          Shops: [
            "clothing_store",
            "department_store",
            "shoe_store",
            "shopping_mall",
          ],
          "Baby Care": [
            "pharmacy",
            "supermarket",
            "department_store",
            "shopping_mall",
            "convenience_store",
          ],
          "Indoor Activities": [
            "movie_theater",
            "bowling_alley",
            "aquarium",
            "museum",
            "shopping_mall",
            "spa",
            "gym",
            "zoo",
          ],
        };

        // Collect all types from selected categories
        placeTypes = filters.locationTypes.flatMap(
          (type: string) => typeMapping[type] || [],
        );

        // If no valid types are found, use all available types
        if (placeTypes.length === 0) {
          placeTypes = [
            "park",
            "amusement_park",
            "museum",
            "restaurant",
            "library",
            "aquarium",
            "zoo",
            "cafe",
            "movie_theater",
            "bowling_alley",
            "art_gallery",
            "shopping_mall",
            "spa",
            "gym",
          ];
        }
      }

      // Calculate radius in meters based on filter distance (in km)
      // If no filters are applied, use a default radius of 2km
      const radiusInMeters = (filters?.distance || 2) * 1000;

      // Call the Places API
      const response = await searchNearby(
        googleMapsApiKey,
        location,
        radiusInMeters,
        placeTypes,
      );

      // Transform the response to our Location format
      let transformedLocations = transformPlacesResponse(response);

      // Calculate actual distances
      transformedLocations = transformedLocations.map((loc) => {
        const distanceInKm = calculateDistance(
          location.lat,
          location.lng,
          loc.position.lat,
          loc.position.lng,
        );

        return {
          ...loc,
          distance: kmToMiles(distanceInKm),
        };
      });

      // Update locations state
      setLocations(transformedLocations);
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      setPlacesError("Failed to fetch nearby places. Please try again.");
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handleFilterChange = (filters: any) => {
    if (userLocation) {
      fetchNearbyPlaces(userLocation, filters);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white p-4">
        <Alert variant="destructive" className="max-w-md bg-white">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading Google Maps</AlertTitle>
          <AlertDescription>
            There was an error loading the map. Please check your API key and
            try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Google Map */}
      <div className="w-full h-full">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={mapZoom}
          options={defaultMapOptions}
          onLoad={onMapLoad}
          onClick={() => setSelectedLocation(null)}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              }}
              title="Your location"
            />
          )}

          {/* Location markers */}
          {locations.map((location) => {
            // Determine color and icon based on location type
            const getLocationTypeConfig = (type: string) => {
              const typeConfig = {
                Park: { color: "#10b981" },
                "Amusement Park": { color: "#f97316" },
                Museum: { color: "#8b5cf6" },
                Restaurant: { color: "#ef4444" },
                Café: { color: "#ef4444" },
                Library: { color: "#0ea5e9" },
                Aquarium: { color: "#0ea5e9" },
                Zoo: { color: "#84cc16" },
                "Movie Theater": { color: "#f97316" },
                Attraction: { color: "#f97316" },
                Playground: { color: "#10b981" },
                "Art Gallery": { color: "#8b5cf6" },
                "Shopping Mall": { color: "#f97316" },
                Spa: { color: "#0ea5e9" },
                Gym: { color: "#84cc16" },
                "Bowling Alley": { color: "#f97316" },
                "Clothing Store": { color: "#ec4899" },
                "Department Store": { color: "#ec4899" },
                "Shoe Store": { color: "#ec4899" },
                Pharmacy: { color: "#0ea5e9" },
                Supermarket: { color: "#0ea5e9" },
                "Convenience Store": { color: "#0ea5e9" },
              };

              // Default to Park if type not found
              return typeConfig[type] || typeConfig["Park"];
            };

            const typeConfig = getLocationTypeConfig(location.type);
            const color = location.isBookmarked ? "#ec4899" : typeConfig.color;

            return (
              <Marker
                key={location.id}
                position={location.position}
                onClick={() => handleMarkerClick(location.id)}
                icon={{
                  url: `data:image/svg+xml;utf-8,${encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="1"/></svg>`,
                  )}`,
                  anchor: new google.maps.Point(15, 15),
                  scaledSize: new google.maps.Size(30, 30),
                }}
              >
                {/* InfoWindow removed - now using the card at the bottom */}
              </Marker>
            );
          })}
        </GoogleMap>
      </div>
      {/* Location error message */}
      {locationError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <Alert variant="destructive" className="max-w-md bg-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        </div>
      )}
      {/* Loading indicator for places */}
      {isLoadingPlaces && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-white py-2 px-4 rounded-full shadow-md flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2 text-purple-600" />
          <span className="text-sm font-medium">
            Finding family-friendly places...
          </span>
        </div>
      )}
      {/* Places error message */}
      {placesError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <Alert variant="destructive" className="max-w-md bg-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Finding Places</AlertTitle>
            <AlertDescription>{placesError}</AlertDescription>
          </Alert>
        </div>
      )}
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-white shadow-md hover:bg-gray-100"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Layers className="h-5 w-5 text-purple-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle Filters</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-white shadow-md hover:bg-gray-100"
                onClick={handleZoomIn}
              >
                <Plus className="h-5 w-5 text-purple-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-white shadow-md hover:bg-gray-100"
                onClick={handleZoomOut}
              >
                <Minus className="h-5 w-5 text-purple-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-white shadow-md hover:bg-gray-100"
                onClick={getUserLocation}
              >
                <Compass className="h-5 w-5 text-purple-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>My Location</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-white shadow-md hover:bg-gray-100"
                onClick={() => userLocation && fetchNearbyPlaces(userLocation)}
                disabled={isLoadingPlaces || !userLocation}
              >
                <Search className="h-5 w-5 text-purple-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Search Nearby</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-4 left-4">
          <FilterPanel isOpen={true} onFilterChange={handleFilterChange} />
        </div>
      )}
      {/* Location Carousel */}
      <LocationCarousel
        locations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={handleLocationSelect}
        onBookmarkToggle={handleBookmarkToggle}
        onGetDirections={handleGetDirections}
        onCloseCard={() => setSelectedLocation(null)}
      />
      {/* Bookmarks Panel */}
      <BookmarksPanel
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        onSelectLocation={(location) => {
          handleLocationSelect(
            locations.find((loc) => loc.id === location.id) as Location,
          );
          setShowBookmarks(false);
        }}
        bookmarkedLocations={bookmarkedLocations.map((loc) => ({
          id: loc.id,
          name: loc.name,
          type: loc.type,
          distance: loc.distance,
          rating: loc.rating,
          address: loc.address,
          imageUrl: loc.imageUrl,
        }))}
        onRemoveBookmark={(locationId) => {
          const locationToUpdate = locations.find(
            (loc) => loc.id === locationId,
          );
          if (locationToUpdate) {
            handleBookmarkToggle(locationToUpdate);
          }
        }}
      />
      {/* Floating action button to open bookmarks */}
    </div>
  );
};

export default MapView;
