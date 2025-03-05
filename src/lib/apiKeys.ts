// Function to securely load API keys
export const getGoogleMapsApiKey = (): string => {
  // Get the key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // Validate the key exists
  if (!apiKey) {
    console.error(
      "Google Maps API key is missing. Please check your environment variables.",
    );
  }

  return apiKey;
};
