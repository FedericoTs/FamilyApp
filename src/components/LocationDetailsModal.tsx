import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Star,
  Navigation,
  Clock,
  MapPin,
  Phone,
  Globe,
  Users,
  Baby,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { googleMapsApiKey } from "@/lib/googleMaps";

interface LocationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  onGetDirections: () => void;
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    weekday_text: string[];
    open_now: boolean;
  };
  rating: number;
  user_ratings_total: number;
  photos: {
    getUrl: (options: { maxWidth: number; maxHeight: number }) => string;
  }[];
  reviews?: {
    author_name: string;
    rating: number;
    text: string;
    relative_time_description: string;
  }[];
  price_level?: number;
  types: string[];
}

const LocationDetailsModal = ({
  isOpen,
  onClose,
  locationName,
  onGetDirections,
}: LocationDetailsModalProps) => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && locationName) {
      fetchPlaceDetails(locationName);
    }
  }, [isOpen, locationName]);

  const fetchPlaceDetails = async (placeName: string) => {
    setLoading(true);
    setError(null);

    try {
      // Create a dummy div for the map (required by PlacesService)
      const mapDiv = document.createElement("div");
      mapDiv.style.display = "none";
      document.body.appendChild(mapDiv);

      // Create a map instance (required for PlacesService)
      const map = new google.maps.Map(mapDiv, {
        center: { lat: 0, lng: 0 },
        zoom: 1,
      });

      // Create PlacesService instance
      const service = new google.maps.places.PlacesService(map);

      // Find place by query
      service.findPlaceFromQuery(
        {
          query: placeName,
          fields: ["place_id"],
        },
        (results, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0
          ) {
            const placeId = results[0].place_id;

            // Get place details
            service.getDetails(
              {
                placeId: placeId,
                fields: [
                  "name",
                  "formatted_address",
                  "formatted_phone_number",
                  "website",
                  "opening_hours",
                  "rating",
                  "user_ratings_total",
                  "photos",
                  "reviews",
                  "price_level",
                  "types",
                ],
              },
              (place, detailsStatus) => {
                // Clean up the dummy div
                document.body.removeChild(mapDiv);

                if (
                  detailsStatus === google.maps.places.PlacesServiceStatus.OK &&
                  place
                ) {
                  setPlaceDetails(place as unknown as PlaceDetails);

                  // Get photo URLs
                  if (place.photos && place.photos.length > 0) {
                    const photoUrls = place.photos
                      .slice(0, 5)
                      .map((photo) =>
                        photo.getUrl({ maxWidth: 800, maxHeight: 600 }),
                      );
                    setPhotos(photoUrls);
                  }
                } else {
                  setError("Could not retrieve place details");
                }
                setLoading(false);
              },
            );
          } else {
            document.body.removeChild(mapDiv);
            setError("Could not find the location");
            setLoading(false);
          }
        },
      );
    } catch (err) {
      console.error("Error fetching place details:", err);
      setError("An error occurred while fetching place details");
      setLoading(false);
    }
  };

  // Format price level to $ symbols
  const formatPriceLevel = (level?: number) => {
    if (level === undefined) return "";
    return "$".repeat(level);
  };

  // Get a user-friendly category from place types
  const getPlaceCategory = (types: string[]) => {
    const typeMap: Record<string, string> = {
      park: "Park",
      amusement_park: "Amusement Park",
      museum: "Museum",
      restaurant: "Restaurant",
      library: "Library",
      aquarium: "Aquarium",
      zoo: "Zoo",
      cafe: "Café",
      movie_theater: "Movie Theater",
      tourist_attraction: "Attraction",
      art_gallery: "Art Gallery",
      shopping_mall: "Shopping Mall",
      spa: "Spa",
      gym: "Gym",
      bowling_alley: "Bowling Alley",
      clothing_store: "Clothing Store",
      department_store: "Department Store",
      shoe_store: "Shoe Store",
      pharmacy: "Pharmacy",
      supermarket: "Supermarket",
      convenience_store: "Convenience Store",
    };

    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }

    return "Place";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden p-0 rounded-xl border-0 shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading place details...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 p-6">
            <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
            <span className="text-red-500">{error}</span>
          </div>
        ) : placeDetails ? (
          <>
            <div className="relative h-40 w-full overflow-hidden">
              {photos.length > 0 ? (
                <img
                  src={photos[0]}
                  alt={placeDetails.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h2 className="text-white text-2xl font-bold">
                  {placeDetails.name}
                </h2>
                {placeDetails.types && (
                  <div className="flex items-center mt-1">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      {getPlaceCategory(placeDetails.types)}
                    </Badge>
                    {placeDetails.price_level !== undefined && (
                      <span className="ml-2 text-white font-medium">
                        {formatPriceLevel(placeDetails.price_level)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <ScrollArea className="max-h-[calc(85vh-40px-72px)]">
              <div className="p-5 w-full">
                <div className="flex items-center mb-4 bg-gradient-to-r from-pink-50 to-purple-50 p-2 rounded-lg">
                  {placeDetails.rating && (
                    <div className="flex items-center mr-4">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{placeDetails.rating}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({placeDetails.user_ratings_total} reviews)
                      </span>
                    </div>
                  )}
                  {placeDetails.opening_hours?.open_now !== undefined && (
                    <Badge
                      className={
                        placeDetails.opening_hours.open_now
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {placeDetails.opening_hours.open_now
                        ? "Open Now"
                        : "Closed"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {placeDetails.formatted_address && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="break-words">
                        {placeDetails.formatted_address}
                      </span>
                    </div>
                  )}

                  {placeDetails.formatted_phone_number && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                      <a
                        href={`tel:${placeDetails.formatted_phone_number}`}
                        className="text-purple-600 hover:underline"
                      >
                        {placeDetails.formatted_phone_number}
                      </a>
                    </div>
                  )}

                  {placeDetails.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                      <a
                        href={placeDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline break-all max-w-[calc(100%-2rem)]"
                      >
                        {placeDetails.website}
                      </a>
                    </div>
                  )}

                  {placeDetails.opening_hours?.weekday_text && (
                    <div className="mt-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-purple-600 mr-2" />
                        <h3 className="font-medium text-purple-700">
                          Opening Hours
                        </h3>
                      </div>
                      <div className="ml-7 text-sm space-y-1 bg-gray-50 p-2 rounded-lg mt-2">
                        {placeDetails.opening_hours.weekday_text.map(
                          (day, index) => (
                            <div key={index}>{day}</div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Family-friendly indicators */}
                  <div className="mt-4">
                    <h3 className="font-medium mb-2 text-purple-700">
                      Family-Friendly Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-100 text-purple-700">
                        <Baby className="h-3.5 w-3.5 mr-1" /> Kid-Friendly
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        <Users className="h-3.5 w-3.5 mr-1" /> Family Space
                      </Badge>
                      {/* Add more badges based on place types */}
                      {placeDetails.types.includes("restaurant") && (
                        <Badge className="bg-green-100 text-green-700">
                          Kids Menu
                        </Badge>
                      )}
                      {placeDetails.types.includes("park") && (
                        <Badge className="bg-green-100 text-green-700">
                          Playground
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Photo gallery */}
                  {photos.length > 1 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2 text-purple-700">
                        Photos
                      </h3>
                      <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
                        {photos.slice(1).map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${placeDetails.name} ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews section */}
                  {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                    <div className="mt-4 mb-20">
                      <h3 className="font-medium mb-2 text-purple-700">
                        Reviews
                      </h3>
                      <div className="space-y-3 mb-16 bg-gray-50 p-3 rounded-lg w-full overflow-hidden">
                        {placeDetails.reviews
                          .slice(0, 3)
                          .map((review, index) => (
                            <div
                              key={index}
                              className="border-b border-gray-200 pb-3 last:border-0 last:pb-0 w-full overflow-hidden"
                            >
                              <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                                <span className="font-medium">
                                  {review.author_name}
                                </span>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span>{review.rating}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 break-words whitespace-normal">
                                {review.text}
                              </p>
                              <span className="text-xs text-gray-500">
                                {review.relative_time_description}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-4 border-t bg-gradient-to-r from-pink-50 to-purple-50">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Close
              </Button>
              <Button
                onClick={onGetDirections}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <span className="text-gray-500">No location selected</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LocationDetailsModal;
