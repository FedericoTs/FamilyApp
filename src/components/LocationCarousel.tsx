import React, { useRef, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { MapPin, Star } from "lucide-react";
import LocationCard from "./LocationCard";

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

interface LocationCarouselProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  onBookmarkToggle?: (location: Location) => void;
  onGetDirections?: (location: Location) => void;
  onCloseCard?: () => void;
}

const LocationCarousel = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
  onBookmarkToggle = () => {},
  onGetDirections = () => {},
  onCloseCard = () => {},
}: LocationCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // Scroll to the selected location when it changes
  useEffect(() => {
    if (selectedLocation && selectedCardRef.current && scrollRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedLocation]);

  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <ScrollArea
        className="w-full bg-transparent"
        orientation="horizontal"
        ref={scrollRef}
      >
        <div className="flex p-2 gap-3 pb-0 mb-0 items-end">
          {locations.map((location) => {
            const isSelected = selectedLocation?.id === location.id;
            return (
              <div
                key={location.id}
                ref={isSelected ? selectedCardRef : null}
                className="flex-shrink-0 transition-all duration-300 flex items-end"
                onClick={() => !isSelected && onSelectLocation(location)}
              >
                {isSelected ? (
                  <div className="transform scale-100 origin-bottom animate-in zoom-in-95 duration-200 mb-0 self-end">
                    <LocationCard
                      name={location.name}
                      distance={location.distance}
                      rating={location.rating}
                      amenities={location.amenities || ["Family-Friendly"]}
                      ageRange={location.ageRange || "All ages"}
                      imageUrl={location.imageUrl}
                      isBookmarked={location.isBookmarked}
                      onBookmarkToggle={() => onBookmarkToggle(location)}
                      onGetDirections={() => onGetDirections(location)}
                      onClose={onCloseCard}
                    />
                  </div>
                ) : (
                  <MiniLocationCard location={location} />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

interface MiniLocationCardProps {
  location: Location;
}

const MiniLocationCard = ({ location }: MiniLocationCardProps) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-200 w-48 border border-gray-200 bg-white hover:shadow-lg">
      <div className="relative h-24">
        <img
          src={location.imageUrl}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
          <span className="text-xs font-medium">{location.rating}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <span className="text-xs font-medium text-white px-1.5 py-0.5 rounded-full bg-pink-500/80 backdrop-blur-sm">
            {location.type}
          </span>
        </div>
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm line-clamp-1 text-gray-800">
          {location.name}
        </h3>
        <div className="flex items-center mt-1 text-gray-500">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="text-xs line-clamp-1">{location.distance}</span>
        </div>
      </div>
    </div>
  );
};

export default LocationCarousel;
