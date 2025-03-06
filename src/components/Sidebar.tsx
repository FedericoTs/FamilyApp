import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Compass,
  Users,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Coffee,
  Library,
  Palmtree,
  UtensilsCrossed,
  TreePine,
  Home,
  ShoppingBag,
  Baby,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCategorySelect?: (category: string) => void;
  username?: string;
  avatarUrl?: string;
  selectedCategory?: string;
  nearbyOpen?: boolean;
}

const Sidebar = ({
  isOpen = true,
  onClose = () => {},
  onCategorySelect = () => {},
  username = "Sarah Johnson",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  selectedCategory = null,
  nearbyOpen = true,
}: SidebarProps) => {
  const [isNearbyOpen, setIsNearbyOpen] = useState(nearbyOpen);

  const locationCategories = [
    {
      name: "Saved Locations",
      icon: <MapPin className="h-4 w-4 text-pink-500" />,
    },
    { name: "Indoor", icon: <Home className="h-4 w-4 text-blue-400" /> },
    {
      name: "Playgrounds",
      icon: <Palmtree className="h-4 w-4 text-green-500" />,
    },
    {
      name: "Restaurants",
      icon: <UtensilsCrossed className="h-4 w-4 text-red-500" />,
    },
    { name: "Cafés", icon: <Coffee className="h-4 w-4 text-amber-600" /> },
    {
      name: "Museums",
      icon: <Coffee className="h-4 w-4 text-purple-600" />,
    },
    { name: "Libraries", icon: <Library className="h-4 w-4 text-blue-600" /> },
    {
      name: "Shops",
      icon: <ShoppingBag className="h-4 w-4 text-pink-500" />,
    },
    {
      name: "Baby Care",
      icon: <Baby className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <div
      className={`h-full bg-white border-r border-gray-200 w-64 flex flex-col shadow-md`}
    >
      <div className="p-4 flex items-center">
        <MapPin className="h-6 w-6 text-pink-500" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent ml-2">
          FamilyApp
        </h1>
      </div>

      <div className="flex-1 overflow-auto px-3 py-2">
        <nav className="space-y-1">
          <Link to="/" className="block">
            <Collapsible open={isNearbyOpen} onOpenChange={setIsNearbyOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
                <div className="flex items-center">
                  <Compass className="h-5 w-5 text-purple-600 mr-3" />
                  <span>Nearby</span>
                </div>
                {isNearbyOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-10 pr-2 py-1 space-y-1">
                {locationCategories.map((category) => (
                  <Link
                    to="/"
                    key={category.name}
                    className={`flex items-center w-full p-2 rounded-md ${selectedCategory === category.name ? "bg-purple-100 text-purple-700 font-medium" : "hover:bg-purple-50 text-gray-600"} text-sm`}
                    onClick={() => {
                      // Notify parent component about category selection
                      onCategorySelect(category.name);

                      // Close the sidebar on mobile after selection (optional)
                      if (window.innerWidth < 768 && onClose) {
                        onClose();
                      }
                    }}
                  >
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </Link>

          <Link
            to="/discover"
            className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
          >
            <Heart className="h-5 w-5 text-pink-500 mr-3" />
            <span>Discover</span>
          </Link>

          <Link
            to="/community"
            className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
          >
            <Users className="h-5 w-5 text-blue-500 mr-3" />
            <span>Community</span>
          </Link>

          <Link
            to="/family"
            className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
          >
            <Users className="h-5 w-5 text-green-500 mr-3" />
            <span>My Family</span>
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Link
          to="/settings"
          className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium mb-4"
        >
          <Settings className="h-5 w-5 text-gray-500 mr-3" />
          <span>Settings</span>
        </Link>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <Link to="/profile" className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>{username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{username}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
