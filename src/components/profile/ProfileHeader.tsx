import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Profile } from "@/types/profile";

interface ProfileHeaderProps {
  profile: Profile;
  onEditClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditClick,
}) => {
  const userInitial = profile.username
    ? profile.username.charAt(0).toUpperCase()
    : "?";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || profile.id}`;

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={avatarUrl} alt={profile.username || "User"} />
        <AvatarFallback>{userInitial}</AvatarFallback>
      </Avatar>

      <h2 className="text-xl font-bold dark:text-white">
        {profile.username || "User"}
      </h2>

      {profile.main_location && (
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
          <MapPin className="h-3 w-3 mr-1" /> {profile.main_location}
        </p>
      )}

      <Button
        onClick={onEditClick}
        className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 dark:from-purple-700 dark:to-pink-700"
      >
        Edit Profile
      </Button>
    </div>
  );
};

export default ProfileHeader;
