import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MapPin, Heart, Settings, Bell, Shield, Users } from "lucide-react";

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">Sarah Johnson</h2>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> New York, NY
                </p>
                <Button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-600">
                  Edit Profile
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-gray-500">
                    sarah.j@example.com
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Phone</span>
                  <span className="text-sm text-gray-500">
                    +1 (555) 123-4567
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Member since</span>
                  <span className="text-sm text-gray-500">March 2023</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="saved">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="saved">Saved Places</TabsTrigger>
              <TabsTrigger value="family">My Family</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 text-pink-500 mr-2" />
                    Saved Places
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>You haven't saved any places yet.</p>
                    <p className="text-sm mt-2">
                      Bookmark locations you love to find them easily later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="family" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    My Family
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No family members added yet.</p>
                    <p className="text-sm mt-2">
                      Add family members to share locations and plan activities
                      together.
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600">
                      Add Family Member
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 text-gray-500 mr-2" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Notification Settings
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">Push Notifications</span>
                        </div>
                        <div className="text-sm text-gray-500">On</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Privacy Settings
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">Location Sharing</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Friends Only
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Connected Accounts
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
