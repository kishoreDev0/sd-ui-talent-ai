import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Search, Camera } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from 'react-country-state-city';
import type { Country, State, City } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

type SettingsTab = 'my-details' | 'password' | 'notifications' | 'integrations';

const SettingsPage: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<SettingsTab>('my-details');
  const [passwordSubTab, setPasswordSubTab] = useState<'change' | 'reset'>(
    'change',
  );
  const [profileImage, setProfileImage] = useState<string>(
    'https://via.placeholder.com/80',
  );
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobileCountryCode: '+1',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    countryId: '',
    stateId: '',
    cityId: '',
    preferredTimeZone: '',
    isActive: true,
    lastLogin: '',
    role: '',
  });

  useEffect(() => {
    // Populate user details from Redux or localStorage
    const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
    if (userData) {
      setUserDetails({
        firstName: userData.first_name || userData.firstName || '',
        lastName: userData.last_name || userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || userData.phone_number || '',
        mobileCountryCode:
          userData.mobile_country_code || userData.mobileCountryCode || '+1',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zip_code || userData.zipCode || '',
        country: userData.country || '',
        countryId: userData.country_id || userData.countryId || '',
        stateId: userData.state_id || userData.stateId || '',
        cityId: userData.city_id || userData.cityId || '',
        preferredTimeZone:
          userData.preferred_time_zone || userData.preferredTimeZone || '',
        isActive: userData.is_active ?? userData.isActive ?? true,
        lastLogin: userData.last_login || userData.lastLogin || '',
        role: userData.role?.name || userData.role_name || '',
      });
      // Set profile image if available
      if (userData.image_url || userData.profile_image || userData.avatar) {
        setProfileImage(
          userData.image_url || userData.profile_image || userData.avatar,
        );
      }
    }
  }, [user]);

  // Get user role ID
  const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
  const roleId = userData?.role?.id ?? userData?.role_id ?? 0;
  const isAdmin = roleId === 1;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'my-details', label: 'My details' },
    { id: 'password', label: 'Password' },
    { id: 'notifications', label: 'Notifications' },
    ...(isAdmin
      ? [{ id: 'integrations' as SettingsTab, label: 'Integrations' }]
      : []),
  ];

  // Notification settings state
  const [notifications, setNotifications] = useState({
    comments: { push: true, email: true, sms: false },
    tags: { push: true, email: false, sms: false },
    reminders: { push: false, email: false, sms: false },
    activity: { push: false, email: false, sms: false },
  });

  const updateNotification = (
    category: keyof typeof notifications,
    type: 'push' | 'email' | 'sms',
    value: boolean,
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value,
      },
    }));
  };

  const renderNotifications = () => (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Notification settings
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          We may still send you important notifications about your account
          outside of your notification settings.
        </p>
      </div>

      {/* Comments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Comments</CardTitle>
          <CardDescription className="text-[10px]">
            These are notifications for comments on your posts and replies to
            your comments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Push
            </span>
            <Switch
              checked={notifications.comments.push}
              onCheckedChange={(checked) =>
                updateNotification('comments', 'push', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Email
            </span>
            <Switch
              checked={notifications.comments.email}
              onCheckedChange={(checked) =>
                updateNotification('comments', 'email', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              SMS
            </span>
            <Switch
              checked={notifications.comments.sms}
              onCheckedChange={(checked) =>
                updateNotification('comments', 'sms', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tags</CardTitle>
          <CardDescription className="text-[10px]">
            These are notifications for when someone tags you in a comment, post
            or story.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Push
            </span>
            <Switch
              checked={notifications.tags.push}
              onCheckedChange={(checked) =>
                updateNotification('tags', 'push', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Email
            </span>
            <Switch
              checked={notifications.tags.email}
              onCheckedChange={(checked) =>
                updateNotification('tags', 'email', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              SMS
            </span>
            <Switch
              checked={notifications.tags.sms}
              onCheckedChange={(checked) =>
                updateNotification('tags', 'sms', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Reminders</CardTitle>
          <CardDescription className="text-[10px]">
            These are notifications to remind you of updates you might have
            missed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Push
            </span>
            <Switch
              checked={notifications.reminders.push}
              onCheckedChange={(checked) =>
                updateNotification('reminders', 'push', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Email
            </span>
            <Switch
              checked={notifications.reminders.email}
              onCheckedChange={(checked) =>
                updateNotification('reminders', 'email', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              SMS
            </span>
            <Switch
              checked={notifications.reminders.sms}
              onCheckedChange={(checked) =>
                updateNotification('reminders', 'sms', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* More activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">More activity about you</CardTitle>
          <CardDescription className="text-[10px]">
            These are notifications for posts on your profile, likes and other
            reactions to your posts, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Push
            </span>
            <Switch
              checked={notifications.activity.push}
              onCheckedChange={(checked) =>
                updateNotification('activity', 'push', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Email
            </span>
            <Switch
              checked={notifications.activity.email}
              onCheckedChange={(checked) =>
                updateNotification('activity', 'email', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              SMS
            </span>
            <Switch
              checked={notifications.activity.sms}
              onCheckedChange={(checked) =>
                updateNotification('activity', 'sms', checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'my-details':
        return (
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                My Details
              </h2>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Profile Image */}
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                      {profileImage &&
                      profileImage !== 'https://via.placeholder.com/80' ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                          {userDetails.firstName?.[0] ||
                            userDetails.email?.[0] ||
                            'U'}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-700 shadow-md">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check file size (2MB = 2 * 1024 * 1024 bytes)
                            if (file.size > 2 * 1024 * 1024) {
                              alert('Image size must be less than 2MB');
                              return;
                            }
                            // Check file type
                            if (
                              ![
                                'image/jpeg',
                                'image/jpg',
                                'image/png',
                              ].includes(file.type)
                            ) {
                              alert(
                                'Only JPG, JPEG, and PNG files are allowed',
                              );
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Camera className="h-3 w-3" />
                    </label>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Check file size (2MB = 2 * 1024 * 1024 bytes)
                              if (file.size > 2 * 1024 * 1024) {
                                alert('Image size must be less than 2MB');
                                return;
                              }
                              // Check file type
                              if (
                                ![
                                  'image/jpeg',
                                  'image/jpg',
                                  'image/png',
                                ].includes(file.type)
                              ) {
                                alert(
                                  'Only JPG, JPEG, and PNG files are allowed',
                                );
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfileImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        Upload Photo
                      </label>
                    </Button>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      JPG, JPEG, or PNG. Max size of 2MB
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <Input
                      placeholder="Enter your first name"
                      className="h-10 text-sm w-full"
                      value={userDetails.firstName}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <Input
                      placeholder="Enter your last name"
                      className="h-10 text-sm w-full"
                      value={userDetails.lastName}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-10 text-sm w-full"
                      value={userDetails.email}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={userDetails.mobileCountryCode}
                        onValueChange={(value) =>
                          setUserDetails({
                            ...userDetails,
                            mobileCountryCode: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-10 w-24 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1 (US)</SelectItem>
                          <SelectItem value="+91">+91 (IN)</SelectItem>
                          <SelectItem value="+44">+44 (UK)</SelectItem>
                          <SelectItem value="+86">+86 (CN)</SelectItem>
                          <SelectItem value="+81">+81 (JP)</SelectItem>
                          <SelectItem value="+49">+49 (DE)</SelectItem>
                          <SelectItem value="+33">+33 (FR)</SelectItem>
                          <SelectItem value="+61">+61 (AU)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="h-10 text-sm flex-1 w-full"
                        value={userDetails.phone}
                        onChange={(e) =>
                          setUserDetails({
                            ...userDetails,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Location Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <CountrySelect
                        defaultValue={
                          userDetails.countryId
                            ? ({
                                id: parseInt(userDetails.countryId) || 0,
                                name: userDetails.country,
                              } as Country)
                            : undefined
                        }
                        onChange={(country: Country) => {
                          if (!country) return;
                          console.log('Country selected:', country);
                          setUserDetails({
                            ...userDetails,
                            countryId: String(country.id || ''),
                            country: country.name || '',
                            stateId: '',
                            state: '',
                            cityId: '',
                            city: '',
                          });
                        }}
                        containerClassName="!border !border-gray-300 dark:!border-gray-600 !rounded-md"
                        inputClassName="h-10 w-full text-sm bg-transparent border-0 outline-none shadow-none focus:ring-0 focus:outline-none dark:bg-slate-800 dark:text-gray-100 px-2 py-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        State
                      </label>
                      <StateSelect
                        countryid={parseInt(userDetails.countryId) || 0}
                        defaultValue={
                          userDetails.stateId
                            ? ({
                                id: parseInt(userDetails.stateId) || 0,
                                name: userDetails.state,
                              } as State)
                            : undefined
                        }
                        onChange={(state: State) => {
                          if (!state) return;
                          console.log(
                            'State selected:',
                            state,
                            'Country ID:',
                            userDetails.countryId,
                          );
                          setUserDetails({
                            ...userDetails,
                            stateId: String(state.id || ''),
                            state: state.name || '',
                            cityId: '',
                            city: '',
                          });
                        }}
                        containerClassName="!border !border-gray-300 dark:!border-gray-600 !rounded-md"
                        inputClassName="h-10 w-full text-sm bg-transparent border-0 outline-none shadow-none focus:ring-0 focus:outline-none dark:bg-slate-800 dark:text-gray-100 px-2 py-1"
                        disabled={
                          !userDetails.countryId ||
                          userDetails.countryId === '' ||
                          parseInt(userDetails.countryId) === 0
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        City
                      </label>
                      <CitySelect
                        countryid={parseInt(userDetails.countryId) || 0}
                        stateid={parseInt(userDetails.stateId) || 0}
                        defaultValue={
                          userDetails.cityId
                            ? ({
                                id: parseInt(userDetails.cityId) || 0,
                                name: userDetails.city,
                              } as City)
                            : undefined
                        }
                        onChange={(city: City) => {
                          if (!city) return;
                          console.log('City selected:', city);
                          setUserDetails({
                            ...userDetails,
                            cityId: String(city.id || ''),
                            city: city.name || '',
                          });
                        }}
                        containerClassName="!border !border-gray-300 dark:!border-gray-600 !rounded-md"
                        inputClassName="h-10 w-full text-sm bg-transparent border-0 outline-none shadow-none focus:ring-0 focus:outline-none dark:bg-slate-800 dark:text-gray-100 px-2 py-1"
                        disabled={
                          !userDetails.countryId ||
                          !userDetails.stateId ||
                          userDetails.countryId === '' ||
                          userDetails.stateId === '' ||
                          parseInt(userDetails.countryId) === 0 ||
                          parseInt(userDetails.stateId) === 0
                        }
                      />
                    </div>
                    <div className="space-y-1 md:col-span-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Zip Code
                      </label>
                      <Input
                        placeholder="Enter your zip code"
                        className="h-10 text-sm w-full"
                        value={userDetails.zipCode}
                        onChange={(e) =>
                          setUserDetails({
                            ...userDetails,
                            zipCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        User Type (Role)
                      </label>
                      <Input
                        placeholder="Role"
                        className="h-10 text-sm w-full"
                        value={userDetails.role}
                        readOnly
                        disabled
                      />
                    </div>
                    {userDetails.lastLogin && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Last Login
                        </label>
                        <Input
                          className="h-10 text-sm w-full"
                          value={
                            userDetails.lastLogin
                              ? new Date(userDetails.lastLogin).toLocaleString()
                              : 'Never'
                          }
                          readOnly
                          disabled
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button size="sm" className="h-8 px-3 text-xs">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'notifications':
        return renderNotifications();
      case 'password':
        return (
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Password
              </h2>
            </div>

            {/* Sub-tabs for Password */}
            <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setPasswordSubTab('change')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 ${
                  passwordSubTab === 'change'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setPasswordSubTab('reset')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 ${
                  passwordSubTab === 'reset'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Reset Password
              </button>
            </div>

            {/* Change Password Tab */}
            {passwordSubTab === 'change' && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Change Password</CardTitle>
                  <CardDescription className="text-[10px]">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      className="h-10 text-sm w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="h-10 text-sm w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="h-10 text-sm w-full"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button size="sm" className="h-8 px-3 text-xs">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reset Password Tab */}
            {passwordSubTab === 'reset' && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reset Password</CardTitle>
                  <CardDescription className="text-[10px]">
                    Forgot your password? Reset it using your email address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="h-10 text-sm w-full"
                      value={userDetails.email}
                      readOnly
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                    >
                      Send Reset Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'integrations':
        // Only allow admin to access integrations
        if (!isAdmin) {
          return null;
        }
        return (
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Integrations and connected apps
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Supercharge your workflow and connect the tool you use every
                day.
              </p>
            </div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Available Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Integration settings coming soon.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout role={role}>
      <div className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-400 h-8 px-2 text-xs"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Settings
              </h1>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input placeholder="Search" className="pl-7 h-8 w-48 text-xs" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-3">{renderContent()}</div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
