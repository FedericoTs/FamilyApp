import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Layers,
  Plus,
  Minus,
  Compass,
  AlertCircle,
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
  initialZoom = 13,
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
  const [locations] = useState<Location[]>([
    {
      id: "1",
      name: "Central Park Playground",
      type: "Playground",
      position: { lat: 40.7812, lng: -73.9665 },
      distance: "0.5 miles",
      rating: 4.8,
      amenities: ["Restrooms", "Water Fountain", "Picnic Area", "Shade"],
      ageRange: "2-10 years",
      address: "123 Park Avenue, New York, NY",
      imageUrl:
        "https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=600&q=80",
      isBookmarked: true,
    },
    {
      id: "2",
      name: "Kid-Friendly Café",
      type: "Restaurant",
      position: { lat: 40.7215, lng: -73.9991 },
      distance: "0.8 miles",
      rating: 4.5,
      amenities: ["High Chairs", "Kids Menu", "Changing Table", "Play Area"],
      ageRange: "0-12 years",
      address: "456 Main Street, New York, NY",
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
      isBookmarked: false,
    },
    {
      id: "3",
      name: "Children's Museum",
      type: "Museum",
      position: { lat: 40.7045, lng: -74.0123 },
      distance: "1.2 miles",
      rating: 4.9,
      amenities: ["Interactive Exhibits", "Restrooms", "Café", "Gift Shop"],
      ageRange: "3-12 years",
      address: "789 Education Lane, New York, NY",
      imageUrl:
        "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=600&q=80",
      isBookmarked: true,
    },
  ]);

  // Initialize bookmarked locations
  useEffect(() => {
    const initialBookmarks = locations.filter(
      (location) => location.isBookmarked,
    );
    setBookmarkedLocations(initialBookmarks);
  }, [locations]);

  // Get user's current location
  useEffect(() => {
    if (isLoaded) {
      getUserLocation();
    }
  }, [isLoaded]);

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
    setShowInfoWindow(true);

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
      setShowInfoWindow(true);
    }
  };

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

  const handleFilterChange = (filters: any) => {
    // In a real app, this would filter the locations shown on the map
    console.log("Filters applied:", filters);
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white p-4">
        <Alert variant="destructive" className="max-w-md">
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
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={location.position}
              onClick={() => handleMarkerClick(location.id)}
              icon={{
                url: `data:image/svg+xml;utf-8,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 24" fill="none" stroke="${location.isBookmarked ? "#ec4899" : "#9333ea"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="${location.isBookmarked ? "#ec4899" : "#9333ea"}" stroke="white"/></svg>`,
                )}`,
              }}
            >
              {showInfoWindow && activeMarker === location.id && (
                <InfoWindow onCloseClick={handleInfoWindowClose}>
                  <div className="p-2 max-w-[250px]">
                    <h3 className="font-semibold text-gray-800">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-500">{location.type}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {location.distance} away
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-amber-500 text-sm mr-1">★</span>
                      <span className="text-sm">{location.rating}</span>
                    </div>
                    <button
                      className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocation(location);
                      }}
                    >
                      View details
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>

      {/* Location error message */}
      {locationError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{locationError}</AlertDescription>
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
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-4 left-4">
          <FilterPanel isOpen={true} onFilterChange={handleFilterChange} />
        </div>
      )}

      {/* Selected Location Card */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <LocationCard
            name={selectedLocation.name}
            distance={selectedLocation.distance}
            rating={selectedLocation.rating}
            amenities={selectedLocation.amenities}
            ageRange={selectedLocation.ageRange}
            imageUrl={selectedLocation.imageUrl}
            isBookmarked={selectedLocation.isBookmarked}
            onBookmarkToggle={() => handleBookmarkToggle(selectedLocation)}
            onGetDirections={() => handleGetDirections(selectedLocation)}
          />
        </div>
      )}

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
      <Button
        className="absolute bottom-4 right-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg"
        size="icon"
        onClick={() => setShowBookmarks(true)}
      >
        <MapPin className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MapView;
