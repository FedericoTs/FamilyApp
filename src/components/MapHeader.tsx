import React, { useState, useEffect } from "react";
import { Search, Bookmark, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { googleMapsApiKey } from "@/lib/googleMaps";

interface MapHeaderProps {
  onSearch?: (query: string) => void;
  onBookmarksToggle?: () => void;
  onLogoClick?: () => void;
}

const MapHeader = ({
  onSearch = () => {},
  onBookmarksToggle = () => {},
  onLogoClick = () => {},
}: MapHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Text search function using Google Places API
  const performTextSearch = async (
    query: string,
    location?: { lat: number; lng: number },
  ) => {
    if (!query || !googleMapsApiKey) return;

    setIsLoading(true);
    try {
      // For a production app, we would use a server-side API endpoint
      // to protect our API key. Here's how it would be implemented:

      // 1. Create a server endpoint that proxies requests to Google Places API
      const apiEndpoint = "/api/places/textsearch";

      // 2. Prepare the request parameters according to Google Places API docs
      const requestData = {
        query: query, // The search text (e.g., "parks in New York")
        key: googleMapsApiKey,
        language: "en",
      };

      // 3. Add location bias if available to improve relevance
      if (location) {
        requestData["location"] = `${location.lat},${location.lng}`;
        requestData["radius"] = 10000; // 10km radius
      }

      // 4. In production, we would make the actual API call:
      // const response = await fetch(apiEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestData)
      // });
      // const data = await response.json();
      // Process the results...

      // If not on the home page, navigate there to show results
      if (!isHomePage) {
        navigate("/");
      }

      // For this demo, dispatch a custom event that MapView will listen for
      const searchEvent = new CustomEvent("map:search", {
        detail: { query },
      });
      window.dispatchEvent(searchEvent);

      // Simulate API call completion
      setTimeout(() => {
        onSearch(query);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error performing text search:", error);
      setIsLoading(false);
    }
  };

  // Get autocomplete suggestions from Google Places API
  const getAutocompleteSuggestions = async (query: string) => {
    if (!query || query.length < 2 || !googleMapsApiKey) return;

    setIsLoading(true);
    try {
      // In a production app, this would be a server-side API call to protect the API key
      // Here we're simulating what the actual API response would look like

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // This is what the actual API response structure would look like
      // We're simulating the response from Google Places Autocomplete API
      const mockApiResponse = {
        predictions: [
          {
            description: `${query} Park`,
            place_id: "place_id_1",
            structured_formatting: {
              main_text: `${query} Park`,
              secondary_text: "New York, NY, USA",
            },
            types: ["park", "point_of_interest", "establishment"],
          },
          {
            description: `${query} Playground`,
            place_id: "place_id_2",
            structured_formatting: {
              main_text: `${query} Playground`,
              secondary_text: "New York, NY, USA",
            },
            types: ["park", "point_of_interest", "establishment"],
          },
          {
            description: `${query} Children's Museum`,
            place_id: "place_id_3",
            structured_formatting: {
              main_text: `${query} Children's Museum`,
              secondary_text: "New York, NY, USA",
            },
            types: ["museum", "point_of_interest", "establishment"],
          },
          {
            description: `${query} Family Restaurant`,
            place_id: "place_id_4",
            structured_formatting: {
              main_text: `${query} Family Restaurant`,
              secondary_text: "New York, NY, USA",
            },
            types: ["restaurant", "food", "point_of_interest", "establishment"],
          },
          {
            description: `Family-friendly ${query}`,
            place_id: "place_id_5",
            structured_formatting: {
              main_text: `Family-friendly ${query}`,
              secondary_text: "New York, NY, USA",
            },
            types: ["point_of_interest", "establishment"],
          },
        ],
        status: "OK",
      };

      // Extract just the descriptions from the predictions
      // This is what we would do with the actual API response
      const suggestions = mockApiResponse.predictions.map((p) => p.description);

      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Store the timeout ID for debouncing
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Handle search input changes with debounce
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear any existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (query.length > 1) {
      // Debounce the API call to avoid too many requests
      // Google's API has rate limits, so this is important
      const timeoutId = setTimeout(() => {
        getAutocompleteSuggestions(query);
      }, 300); // 300ms debounce time

      setDebounceTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Clean up the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performTextSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    performTextSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <header className="bg-white shadow-md h-20 px-4 md:px-6 flex items-center justify-center sticky top-0 z-10">
      <div className="relative max-w-md w-full">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            type="text"
            placeholder="Find family-friendly places..."
            className="w-full pl-10 pr-4 py-2 rounded-full border-purple-100 focus-visible:ring-purple-300"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching
              </span>
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 mr-2" />
                    {suggestion}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default MapHeader;
