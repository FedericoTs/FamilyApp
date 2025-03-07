import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Star,
  Navigation,
  Bookmark,
  BookmarkCheck,
  Baby,
  Users,
  X,
  Eye,
} from "lucide-react";
import LocationDetailsModal from "./LocationDetailsModal";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { useToast } from "./ui/use-toast";
import { Location } from "@/types/location";

interface LocationCardProps {
  name?: string;
  distance?: string;
  rating?: number;
  amenities?: string[];
  ageRange?: string;
  imageUrl?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onGetDirections?: () => void;
  onClose?: () => void;
}

const LocationCard = ({
  name = "Central Park Playground",
  distance = "0.5 miles away",
  rating = 4.5,
  amenities = ["Restrooms", "Water Fountain", "Picnic Area", "Shade"],
  ageRange = "2-10 years",
  imageUrl = "https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=600&q=80",
  isBookmarked = false,
  onBookmarkToggle = () => {},
  onGetDirections = () => {},
  onClose = () => {},
}: LocationCardProps) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { isLocationSaved, saveLocation, removeSavedLocation } =
    useSavedLocations();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Check if this location is saved in the database
  // This will override the isBookmarked prop with the actual saved state from the database
  const locationId = name.replace(/\s+/g, "-").toLowerCase();
  // Always prioritize the database state over the prop
  const isSaved = isLocationSaved?.(locationId) ?? isBookmarked;

  const handleBookmarkToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent any parent click events
      e.stopPropagation();
    }

    if (isSaving) return; // Prevent multiple clicks

    setIsSaving(true);

    try {
      // Directly use the saved locations hook functions
      if (isSaved) {
        // If already saved, remove it
        (await removeSavedLocation?.(locationId)) || onBookmarkToggle();
      } else {
        // If not saved, save it
        const location = {
          id: locationId,
          name,
          type: "Place",
          position: { lat: 0, lng: 0 }, // Default position if not provided
          distance,
          rating: rating || 0,
          amenities: amenities || [],
          ageRange,
          address: "",
          imageUrl,
          isBookmarked: true,
        };
        (await saveLocation?.(location)) || onBookmarkToggle();
      }

      // Show toast notification
      toast({
        title: isSaved ? "Location Removed" : "Location Saved",
        description: isSaved
          ? `${name} has been removed from your saved places.`
          : `${name} has been added to your saved places.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isSaved ? "remove" : "save"} location. Please try again.`,
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="h-48 w-full relative">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
          <Button
            variant={isSaved ? "default" : "ghost"}
            size="icon"
            className={`absolute top-2 right-2 ${isSaved ? "bg-pink-500 hover:bg-pink-600" : "bg-white/80 hover:bg-white"} rounded-full`}
            onClick={handleBookmarkToggle}
            disabled={isSaving}
            aria-label={
              isSaved ? "Remove from saved locations" : "Save location"
            }
          >
            {isSaving ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-white" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 bg-white/80 rounded-full hover:bg-white"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <CardTitle className="text-white text-xl font-bold">
              {name}
            </CardTitle>
            <div className="flex items-center mt-1">
              <Badge className="bg-pink-500 text-white mr-2">{ageRange}</Badge>
              <div className="flex items-center text-white">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{rating}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-500">{distance}</span>
          <Button
            variant="outline"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
            onClick={() => setShowDetailsModal(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Amenities
            </h3>
            <div className="flex flex-wrap gap-1">
              {amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Family Features
            </h3>
            <div className="flex flex-wrap gap-1">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                <Baby className="h-3.5 w-3.5 mr-1" /> Kid-Friendly
              </Badge>
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <Users className="h-3.5 w-3.5 mr-1" /> Family Space
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          onClick={onGetDirections}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Get Directions
        </Button>
      </CardFooter>

      <LocationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        locationName={name}
        onGetDirections={onGetDirections}
      />
    </Card>
  );
};

export default LocationCard;
