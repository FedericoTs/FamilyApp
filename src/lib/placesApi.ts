// Google Places API functions using Google Maps JavaScript API

// Search for places near a location
export const searchNearby = async (
  apiKey: string,
  center: { lat: number; lng: number },
  radius: number = 5000, // Default 5km radius
  types: string[] = [
    "park",
    "amusement_park",
    "museum",
    "restaurant",
    "library",
  ],
) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a dummy div for the map (required by PlacesService)
      const mapDiv = document.createElement("div");
      mapDiv.style.display = "none";
      document.body.appendChild(mapDiv);

      // Create a map instance (required for PlacesService)
      const map = new google.maps.Map(mapDiv, {
        center: center,
        zoom: 15,
      });

      // Create PlacesService instance
      const service = new google.maps.places.PlacesService(map);

      // Prepare request
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(center.lat, center.lng),
        radius: radius,
        type: types[0] as google.maps.places.PlaceType, // Primary type
      };

      // Execute nearby search
      service.nearbySearch(request, (results, status) => {
        // Clean up the dummy div
        document.body.removeChild(mapDiv);

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Format the response to match our expected structure
          const formattedResponse = {
            places: results.map((place) => ({
              displayName: { text: place.name },
              formattedAddress: place.vicinity,
              location: {
                latitude: place.geometry?.location?.lat(),
                longitude: place.geometry?.location?.lng(),
              },
              types: place.types,
              rating: place.rating,
              photos: place.photos ? [{ name: place.photos[0]?.getUrl() }] : [],
            })),
          };
          resolve(formattedResponse);
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    } catch (error) {
      console.error("Error searching nearby places:", error);
      reject(error);
    }
  });
};

// Transform Places API response to our Location format
export const transformPlacesResponse = (placesResponse: any) => {
  if (!placesResponse.places || !Array.isArray(placesResponse.places)) {
    return [];
  }

  return placesResponse.places.map((place: any, index: number) => {
    // Extract the first type to use as the location type
    let locationType = "Place";
    if (place.types && place.types.length > 0) {
      // Convert API type format to readable format
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

      // Find the first type that has a mapping
      for (const type of place.types) {
        if (typeMap[type]) {
          locationType = typeMap[type];
          break;
        }
      }
    }

    // Get photo reference if available
    let imageUrl =
      "https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=600&q=80";
    if (place.photos && place.photos.length > 0 && place.photos[0].name) {
      // If using the Google Maps JavaScript API, the photo URL is already provided
      imageUrl = place.photos[0].name;
    }

    return {
      id: `place-${index}-${Date.now()}`,
      name: place.displayName?.text || "Unnamed Location",
      type: locationType,
      position: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
      },
      distance: "Calculating...", // This will be calculated separately
      rating: place.rating || 4.0,
      amenities: ["Family-Friendly"], // Default amenity
      ageRange: "All ages", // Default age range
      address: place.formattedAddress || "",
      imageUrl: imageUrl,
      isBookmarked: false,
    };
  });
};

// Calculate distance between two coordinates in kilometers
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    // Convert to meters if less than 1 km
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} meters`;
  } else if (distanceInKm < 10) {
    // Show one decimal place for distances under 10 km
    return `${distanceInKm.toFixed(1)} km`;
  } else {
    // Round to nearest km for larger distances
    return `${Math.round(distanceInKm)} km`;
  }
};

// Use this instead of kmToMiles for display
export const kmToMiles = (km: number): string => {
  if (km < 0.1) {
    return "nearby";
  } else if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} meters`;
  } else {
    return `${km.toFixed(1)} km`;
  }
};
