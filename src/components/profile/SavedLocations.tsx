import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Heart, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { Badge } from "@/components/ui/badge";

interface SavedLocationsProps {}

const SavedLocations: React.FC<SavedLocationsProps> = () => {
  const { savedLocations, loading, error, removeSavedLocation } =
    useSavedLocations();

  const handleGetDirections = (address: string) => {
    window.open(`https://maps.google.com/?q=${address}`, "_blank");
  };

  const handleRemoveLocation = async (locationId: string) => {
    if (confirm("Are you sure you want to remove this saved location?")) {
      await removeSavedLocation(locationId);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center dark:text-white">
          <Heart className="h-5 w-5 text-pink-500 mr-2" />
          Saved Places
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading saved places...</p>
          </div>
        ) : savedLocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MapPin className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p>You haven't saved any places yet.</p>
            <p className="text-sm mt-2">
              Bookmark locations you love to find them easily later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedLocations.map((location) => (
              <div
                key={location.id}
                className="border dark:border-gray-700 rounded-md overflow-hidden dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-32 w-full relative">
                  <img
                    src={location.image_url}
                    alt={location.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                    <span className="text-xs font-medium">
                      {location.rating}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <Badge className="text-xs font-medium text-white px-1.5 py-0.5 rounded-full bg-pink-500/80 backdrop-blur-sm">
                      {location.type}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium dark:text-white">
                    {location.name}
                  </h3>
                  <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="text-xs truncate">{location.address}</span>
                  </div>
                  <div className="flex justify-between mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => handleGetDirections(location.address)}
                    >
                      <Navigation className="mr-1 h-3 w-3" />
                      Directions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleRemoveLocation(location.location_id)}
                    >
                      <Heart className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedLocations;
