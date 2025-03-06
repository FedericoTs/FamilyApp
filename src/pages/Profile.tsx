import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Toaster } from "@/components/ui/toaster";

// Profile components
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileForm from "@/components/profile/EditProfileForm";
import SavedLocations from "@/components/profile/SavedLocations";
import FamilyMembersList from "@/components/profile/FamilyMembersList";
import ProfileSettings from "@/components/profile/ProfileSettings";
import AccountSettings from "@/components/profile/AccountSettings";

const Profile = () => {
  const {
    profile,
    settings,
    familyMembers,
    loading,
    error,
    updateProfile,
    updateSettings,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("saved");

  const handleProfileUpdate = async (updates) => {
    const result = await updateProfile(updates);
    if (!result.error) {
      setIsEditing(false);
    }
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading profile: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile || !settings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profile not found. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format date for display
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          {isEditing ? (
            <EditProfileForm
              profile={profile}
              onSave={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-6">
              <ProfileHeader
                profile={profile}
                onEditClick={() => setIsEditing(true)}
              />

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-gray-200">
                      Email
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.email}
                    </span>
                  </div>
                  {profile.phone_number && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium dark:text-gray-200">
                        Phone
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {profile.phone_number}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-gray-200">
                      Member since
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {memberSince}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="saved">Saved Places</TabsTrigger>
              <TabsTrigger value="family">My Family</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-4">
              <SavedLocations />
            </TabsContent>

            <TabsContent value="family" className="mt-4">
              <FamilyMembersList
                familyMembers={familyMembers}
                onAdd={addFamilyMember}
                onUpdate={updateFamilyMember}
                onDelete={deleteFamilyMember}
              />
            </TabsContent>

            <TabsContent value="preferences" className="mt-4">
              <ProfileSettings settings={settings} onSave={updateSettings} />
            </TabsContent>

            <TabsContent value="account" className="mt-4">
              <AccountSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Profile;
