import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Heart } from "lucide-react";

interface SavedLocation {
  id: string;
  name: string;
  type: string;
  address: string;
  imageUrl: string;
}

interface SavedLocationsProps {
  locations?: SavedLocation[];
}

const SavedLocations: React.FC<SavedLocationsProps> = ({ locations = [] }) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center dark:text-white">
          <Heart className="h-5 w-5 text-pink-500 mr-2" />
          Saved Places
        </CardTitle>
      </CardHeader>
      <CardContent>
        {locations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MapPin className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p>You haven't saved any places yet.</p>
            <p className="text-sm mt-2">
              Bookmark locations you love to find them easily later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="border dark:border-gray-700 rounded-md overflow-hidden dark:bg-gray-700"
              >
                <div className="h-32 w-full">
                  <img
                    src={location.imageUrl}
                    alt={location.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium dark:text-white">
                    {location.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {location.type}
                  </p>
                  <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="text-xs truncate">{location.address}</span>
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
