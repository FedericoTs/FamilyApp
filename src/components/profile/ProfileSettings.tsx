import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Check } from "lucide-react";
import { ProfileSettings as ProfileSettingsType } from "@/types/profile";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/lib/themeProvider";

interface ProfileSettingsProps {
  settings: ProfileSettingsType;
  onSave: (
    updates: Partial<ProfileSettingsType>,
  ) => Promise<{ error: string | null }>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  settings,
  onSave,
}) => {
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [formData, setFormData] = useState({
    notification_enabled: settings.notification_enabled,
    location_sharing: settings.location_sharing,
    privacy_level: settings.privacy_level,
    color_palette: settings.color_palette,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply theme when color palette changes
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove("dark", "high-contrast");

    // Apply the selected theme
    if (formData.color_palette === "dark") {
      document.documentElement.classList.add("dark");
    } else if (formData.color_palette === "high-contrast") {
      document.documentElement.classList.add("high-contrast");
    }

    // Store the preference in localStorage
    localStorage.setItem("color-theme", formData.color_palette);
  }, [formData.color_palette]);

  // Initialize theme on component mount
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove("dark", "high-contrast");

    // Apply the selected theme
    if (settings.color_palette === "dark") {
      document.documentElement.classList.add("dark");
    } else if (settings.color_palette === "high-contrast") {
      document.documentElement.classList.add("high-contrast");
    }

    // Cleanup on unmount - don't remove the theme as it should persist
    return () => {};
  }, [settings.color_palette]);

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, notification_enabled: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update global theme state when color palette changes
    if (name === "color_palette") {
      setTheme(value as any);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await onSave(formData);
      if (result.error) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Error saving settings",
          description: result.error,
          duration: 1300, // 1.3 seconds
        });
      } else {
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated successfully.",
          icon: <Check className="h-4 w-4 text-green-500" />,
          duration: 1300, // 1.3 seconds
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "An error occurred while saving settings";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: errorMessage,
        duration: 1300, // 1.3 seconds
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="dark:text-gray-200">
                Notifications
              </Label>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Receive notifications about new features and updates
              </p>
            </div>
            <Switch
              id="notifications"
              checked={formData.notification_enabled}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-sharing" className="dark:text-gray-200">
              Location Sharing
            </Label>
            <Select
              value={formData.location_sharing}
              onValueChange={(value) =>
                handleSelectChange("location_sharing", value)
              }
            >
              <SelectTrigger
                id="location-sharing"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <SelectValue placeholder="Select location sharing preference" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="friends_only">Friends Only</SelectItem>
                <SelectItem value="family_only">Family Only</SelectItem>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="none">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy-level" className="dark:text-gray-200">
              Privacy Level
            </Label>
            <Select
              value={formData.privacy_level}
              onValueChange={(value) =>
                handleSelectChange("privacy_level", value)
              }
            >
              <SelectTrigger
                id="privacy-level"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <SelectValue placeholder="Select privacy level" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 dark:from-purple-700 dark:to-pink-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
