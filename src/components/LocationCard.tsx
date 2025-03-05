import React from "react";
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
} from "lucide-react";

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
  return (
    <Card className="w-[350px] overflow-hidden bg-white shadow-lg h-full relative">
      <div className="relative h-32">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 bg-white/80 rounded-full hover:bg-white z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 rounded-full hover:bg-white"
          onClick={onBookmarkToggle}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-pink-500" />
          ) : (
            <Bookmark className="h-5 w-5 text-gray-600" />
          )}
        </Button>
      </div>
      <CardHeader className="pb-2 pt-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-gray-800">
            {name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{distance}</p>
      </CardHeader>
      <CardContent className="py-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {amenities.map((amenity, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              {amenity}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Baby className="h-4 w-4 text-blue-400" />
            <span>{ageRange}</span>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <Users className="h-4 w-4 text-blue-400" />
            <span>Family-friendly</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button
          onClick={onGetDirections}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Navigation className="mr-2 h-4 w-4" />
          Get Directions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LocationCard;
