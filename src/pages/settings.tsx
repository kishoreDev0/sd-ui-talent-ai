import React, { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector, useAppDispatch } from '@/store';
import { UserAPI } from '@/store/service/user/userService';
import { googleOAuthService } from '@/store/google/service/googleOAuthService';

const Settings: React.FC = () => {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);
  const [googleConnectError, setGoogleConnectError] = useState<string | null>(
    null,
  );
  const { showToast } = useToast();
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const userAPI = new UserAPI();

  // Get current user data
  const currentUser = useAppSelector((state) => state.auth.user);

  // Profile form state (only fields supported by backend self-update)
  const [profileData, setProfileData] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    country: currentUser?.country || '',
    preferred_timezone: currentUser?.preferred_timezone || '',
    mobile_country_code: currentUser?.mobile_country_code || '',
    mobile_number: currentUser?.mobile_number || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    checkGoogleConnection();

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const googleSuccess = urlParams.get('google_success');
    const googleError = urlParams.get('google_error');

    if (googleSuccess === 'true') {
      setIsGoogleConnected(true);
      setGoogleConnectError(null);
      showToast('Google Calendar connected successfully!', 'success');
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh the connection status from the server
      checkGoogleConnection();
    } else if (googleError) {
      setIsGoogleConnected(false);
      const errorMessages: Record<string, string> = {
        access_denied: 'You denied access to Google Calendar',
        invalid_state: 'Security error occurred during authentication',
        exchange_failed: 'Failed to complete Google authentication',
        missing_parameters: 'Authentication parameters missing',
      };
      const errorMessage =
        errorMessages[googleError] || 'Failed to connect Google Calendar';
      setGoogleConnectError(errorMessage);
      showToast(errorMessage, 'error');
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showToast]);

  const checkGoogleConnection = async () => {
    try {
      setIsCheckingGoogle(true);
      const response = await googleOAuthService.getStatus();
      // Fix: Access the correct nested data structure
      const connected = response.data?.data?.connected || response.data?.connected || false;
      console.log('Google connection status response:', response.data);
      console.log('Extracted connected status:', connected);
      setIsGoogleConnected(connected);
      setGoogleConnectError(null);
    } catch (error) {
      console.error('Failed to check Google connection:', error);
      setIsGoogleConnected(false);
      setGoogleConnectError('Failed to check connection status');
    } finally {
      setIsCheckingGoogle(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      // Get OAuth URL from backend (authenticated call)
      const response = await googleOAuthService.getConnectUrl();
      if (response.data.success && response.data.data.auth_url) {
        // Redirect to Google OAuth
        window.location.href = response.data.data.auth_url;
      } else {
        showToast('Failed to initiate Google OAuth', 'error');
      }
    } catch (error) {
      console.error('Failed to get OAuth URL:', error);
      showToast('Failed to connect Google Calendar', 'error');
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    try {
      await googleOAuthService.disconnect();
      setIsGoogleConnected(false);
      setGoogleConnectError(null);
      showToast('Google Calendar disconnected successfully', 'success');
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);
      showToast('Failed to disconnect Google Calendar', 'error');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);

      // Create FormData for the API call
      const formData = new FormData();
      Object.entries(profileData).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      const response = await userAPI.updateProfile(formData);

      if (response.data.success) {
        showToast('Profile updated successfully!', 'success');
        // TODO: Update the user in Redux store if needed
        // dispatch(updateUserProfile(response.data.data));
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage =
        error?.response?.data?.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout role={role}>
      <div className="w-full p-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and integrations
          </p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Calendar Integration</CardTitle>
                <CardDescription>
                  Connect your Google Calendar to automatically create meeting
                  links and schedule interviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Google Calendar</span>
                      {isCheckingGoogle ? (
                        <Badge variant="secondary">Checking...</Badge>
                      ) : isGoogleConnected ? (
                        <Badge variant="default" className="bg-green-500">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Not Connected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isGoogleConnected
                        ? 'Your Google Calendar is connected and ready for interview scheduling'
                        : 'Connect Google Calendar to enable automatic meeting creation'}
                    </p>
                    {googleConnectError && (
                      <p className="text-sm text-red-600">
                        {googleConnectError}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isGoogleConnected}
                      disabled={isCheckingGoogle}
                      onCheckedChange={(checked) => {
                        if (checked && !isGoogleConnected) {
                          handleConnectGoogleCalendar();
                        } else if (!checked && isGoogleConnected) {
                          handleDisconnectGoogleCalendar();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkGoogleConnection}
                      disabled={isCheckingGoogle}
                      className="ml-2"
                    >
                      {isCheckingGoogle ? 'Checking...' : 'Refresh'}
                    </Button>
                  </div>
                </div>

                {!isGoogleConnected && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-yellow-800">
                          Google Calendar Required
                        </p>
                        <p className="text-sm text-yellow-700">
                          Interview scheduling requires Google Calendar
                          integration. Please connect your Google account to
                          create and manage interview rounds.
                        </p>
                        <Button
                          onClick={handleConnectGoogleCalendar}
                          size="sm"
                          className="mt-2"
                          disabled={isCheckingGoogle}
                        >
                          Connect Google Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isGoogleConnected && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-green-600 mt-0.5">✅</div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-800">
                          Integration Active
                        </p>
                        <p className="text-sm text-green-700">
                          Your Google Calendar is connected. Interview rounds
                          will automatically create Google Meet links and send
                          calendar invitations to participants.
                        </p>
                        <Button
                          onClick={handleDisconnectGoogleCalendar}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) =>
                          handleProfileInputChange('first_name', e.target.value)
                        }
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) =>
                          handleProfileInputChange('last_name', e.target.value)
                        }
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) =>
                        handleProfileInputChange('country', e.target.value)
                      }
                      placeholder="Enter your country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_timezone">
                      Preferred Timezone
                    </Label>
                    <Input
                      id="preferred_timezone"
                      value={profileData.preferred_timezone}
                      onChange={(e) =>
                        handleProfileInputChange(
                          'preferred_timezone',
                          e.target.value,
                        )
                      }
                      placeholder="e.g., America/New_York"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile_country_code">Country Code</Label>
                      <Input
                        id="mobile_country_code"
                        value={profileData.mobile_country_code}
                        onChange={(e) =>
                          handleProfileInputChange(
                            'mobile_country_code',
                            e.target.value,
                          )
                        }
                        placeholder="e.g., +1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile_number">Phone Number</Label>
                      <Input
                        id="mobile_number"
                        value={profileData.mobile_number}
                        onChange={(e) =>
                          handleProfileInputChange(
                            'mobile_number',
                            e.target.value,
                          )
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Email and other account details can
                      only be updated by administrators. Contact your system
                      administrator if you need to change your email address.
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="min-w-[120px]"
                    >
                      {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Notification settings coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
