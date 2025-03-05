import React, { useState } from "react";
import { Search, Bookmark, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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

  // Mock suggestions based on input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      // Mock suggestions - in a real app, these would come from an API
      const mockSuggestions = [
        `${query} Park`,
        `${query} Playground`,
        `${query} Children's Museum`,
        `${query} Family Restaurant`,
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <header className="bg-white shadow-md h-20 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
          <MapPin className="h-6 w-6 text-pink-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent ml-2">
            FamilyApp
          </h1>
        </div>
      </div>

      <div className="relative max-w-md w-full mx-4">
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
          >
            Search
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

      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBookmarksToggle}
                className="rounded-full hover:bg-pink-50"
              >
                <Bookmark className="h-5 w-5 text-purple-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Saved Locations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default MapHeader;
