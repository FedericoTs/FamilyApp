import React, { useState } from "react";
import { Bookmark, MapPin, Star, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Location {
  id: string;
  name: string;
  type: string;
  distance: string;
  rating: number;
  address: string;
  imageUrl: string;
}

interface BookmarksPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectLocation?: (location: Location) => void;
  bookmarkedLocations?: Location[];
  onRemoveBookmark?: (locationId: string) => void;
}

const BookmarksPanel = ({
  isOpen = true,
  onClose = () => {},
  onSelectLocation = () => {},
  bookmarkedLocations = [
    {
      id: "1",
      name: "Central Park Playground",
      type: "Playground",
      distance: "0.5 miles",
      rating: 4.8,
      address: "123 Park Avenue, New York, NY",
      imageUrl:
        "https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=600&q=80",
    },
    {
      id: "2",
      name: "Kid-Friendly Café",
      type: "Restaurant",
      distance: "0.8 miles",
      rating: 4.5,
      address: "456 Main Street, New York, NY",
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    },
    {
      id: "3",
      name: "Children's Museum",
      type: "Museum",
      distance: "1.2 miles",
      rating: 4.9,
      address: "789 Education Lane, New York, NY",
      imageUrl:
        "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=600&q=80",
    },
  ],
  onRemoveBookmark = () => {},
}: BookmarksPanelProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="bg-white w-[350px] p-0 overflow-hidden"
      >
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center text-xl font-bold text-purple-700">
              <Bookmark className="mr-2 h-5 w-5 text-purple-700" />
              Saved Locations
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] bg-gray-50">
          {bookmarkedLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Bookmark className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                No saved locations
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Bookmark your favorite family-friendly places to see them here.
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {bookmarkedLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onSelect={() => onSelectLocation(location)}
                  onRemove={() => onRemoveBookmark(location.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

interface LocationCardProps {
  location: Location;
  onSelect: () => void;
  onRemove: () => void;
}

const LocationCard = ({ location, onSelect, onRemove }: LocationCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-32 w-full">
        <img
          src={location.imageUrl}
          alt={location.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <X className="h-4 w-4 text-gray-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove from bookmarks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="p-3" onClick={onSelect}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
            {location.type}
          </span>
          <div className="flex items-center text-amber-500">
            <Star className="fill-amber-500 h-3.5 w-3.5 mr-1" />
            <span className="text-xs font-medium">{location.rating}</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mt-2 line-clamp-1">
          {location.name}
        </h3>

        <div className="flex items-center mt-1 text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="text-xs line-clamp-1">{location.address}</span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {location.distance} away
        </div>
      </div>
    </div>
  );
};

export default BookmarksPanel;
