// Google Maps API configuration
import { getGoogleMapsApiKey } from "./apiKeys";
export const googleMapsApiKey = getGoogleMapsApiKey();

export const defaultMapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
};

// Get user's current location
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  });
};
