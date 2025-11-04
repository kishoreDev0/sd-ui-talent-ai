import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authentication/login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, Camera, User, Bell, Lock, LogOut, Calendar, Copy, Building2, Briefcase, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Country, State, City } from 'react-country-state-city';
import {
  GetCountries,
  GetState,
  GetCity,
} from 'react-country-state-city';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SettingsTab = 'my-details' | 'password' | 'notifications' | 'integrations';

const SettingsPage: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<SettingsTab>('my-details');
  const [passwordSubTab, setPasswordSubTab] = useState<'change' | 'reset'>(
    'change',
  );
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    'https://via.placeholder.com/80',
  );
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobileCountryCode: '+1',
    birthday: '',
    bio: '',
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
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

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
        birthday: userData.birthday || userData.birth_date || '',
        bio: userData.bio || userData.biography || '',
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

  // Initialize selected country/state/city when countries are loaded and user data is available
  useEffect(() => {
    if (countries.length > 0 && userDetails.countryId) {
      const countryId = parseInt(userDetails.countryId);
      const foundCountry = countries.find((c) => c.id === countryId);
      if (foundCountry && !selectedCountry) {
        setSelectedCountry(foundCountry);
      }
    }
  }, [countries, userDetails.countryId, selectedCountry]);

  // Initialize state when states are loaded
  useEffect(() => {
    if (states.length > 0 && userDetails.stateId && selectedCountry) {
      const stateId = parseInt(userDetails.stateId);
      const foundState = states.find((s) => s.id === stateId);
      if (foundState && !selectedState) {
        setSelectedState(foundState);
      }
    }
  }, [states, userDetails.stateId, selectedCountry, selectedState]);

  // Initialize city when cities are loaded
  useEffect(() => {
    if (cities.length > 0 && userDetails.cityId && selectedState) {
      const cityId = parseInt(userDetails.cityId);
      const foundCity = cities.find((c) => c.id === cityId);
      if (foundCity && !selectedCity) {
        setSelectedCity(foundCity);
      }
    }
  }, [cities, userDetails.cityId, selectedState, selectedCity]);

  // Get user role ID
  const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
  const roleId = userData?.role?.id ?? userData?.role_id ?? 0;
  const isAdmin = roleId === 1;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'my-details', label: 'Profile base', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notification Settings', icon: <Bell className="h-4 w-4" /> },
    { id: 'password', label: 'Password', icon: <Lock className="h-4 w-4" /> },
    ...(isAdmin
      ? [{ id: 'integrations' as SettingsTab, label: 'Integrations', icon: <Search className="h-4 w-4" /> }]
      : []),
  ];

  const handleLogout = () => {
    try {
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          <div className="space-y-6">
            <form className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="h-10 text-sm w-full"
                    value={`${userDetails.mobileCountryCode || ''} ${userDetails.phone || ''}`.trim()}
                    onChange={(e) => {
                      const value = e.target.value;
                      const match = value.match(/^(\+\d+)?\s*(.*)$/);
                      if (match) {
                        setUserDetails({
                          ...userDetails,
                          mobileCountryCode: match[1] || userDetails.mobileCountryCode,
                          phone: match[2] || '',
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email address
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
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <Combobox
                    options={cities.map((city) => ({
                      value: city.id.toString(),
                      label: city.name,
                    }))}
                    value={selectedCity?.id?.toString()}
                    onValueChange={(value) => {
                      const city = cities.find(
                        (c) => c.id.toString() === value,
                      );
                      setSelectedCity(city || null);
                      setUserDetails({
                        ...userDetails,
                        cityId: city ? String(city.id) : '',
                        city: city?.name || '',
                      });
                    }}
                    placeholder={loadingCities ? "Loading..." : !selectedState ? "Select State first" : "Select City"}
                    searchPlaceholder="Search cities..."
                    emptyMessage={selectedState ? "No cities found" : "Select a state first"}
                    disabled={!selectedState}
                    loading={loadingCities}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State/County
                  </label>
                  <Combobox
                    options={states.map((state) => ({
                      value: state.id.toString(),
                      label: state.name,
                    }))}
                    value={selectedState?.id?.toString()}
                    onValueChange={(value) => {
                      const state = states.find(
                        (s) => s.id.toString() === value,
                      );
                      setSelectedState(state || null);
                      setSelectedCity(null);
                      setUserDetails({
                        ...userDetails,
                        stateId: state ? String(state.id) : '',
                        state: state?.name || '',
                        cityId: '',
                        city: '',
                      });
                    }}
                    placeholder={loadingStates ? "Loading..." : !selectedCountry ? "Select Country first" : "Select State"}
                    searchPlaceholder="Search states..."
                    emptyMessage={selectedCountry ? "No states found" : "Select a country first"}
                    disabled={!selectedCountry}
                    loading={loadingStates}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Fourth Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Postcode
                  </label>
                  <Input
                    type="text"
                    value={userDetails.zipCode}
                    onChange={(e) =>
                      setUserDetails({
                        ...userDetails,
                        zipCode: e.target.value,
                      })
                    }
                    className="h-10 text-sm w-full"
                    placeholder="Enter postcode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <Combobox
                    options={countries.map((country) => ({
                      value: country.id.toString(),
                      label: country.name,
                    }))}
                    value={selectedCountry?.id?.toString()}
                    onValueChange={(value) => {
                      const country = countries.find(
                        (c) => c.id.toString() === value,
                      );
                      setSelectedCountry(country || null);
                      setSelectedState(null);
                      setSelectedCity(null);
                      setUserDetails({
                        ...userDetails,
                        countryId: country ? String(country.id) : '',
                        country: country?.name || '',
                        stateId: '',
                        state: '',
                        cityId: '',
                        city: '',
                      });
                    }}
                    placeholder={loadingCountries ? "Loading..." : "Select Country"}
                    searchPlaceholder="Search countries..."
                    emptyMessage="No countries found"
                    loading={loadingCountries}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Update Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    // Handle save logic here
                    console.log('Saving profile:', userDetails);
                  }}
                  className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white px-6 py-2 h-10 text-sm font-medium"
                >
                  Update
                </Button>
              </div>
            </form>
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

  const [coverImage, setCoverImage] = useState<string>('');
  const [publicProfileUrl, setPublicProfileUrl] = useState<string>('https://app.ahiregro.com/profile/nathaniel-poole');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    // You could use toast here if available
    alert('URL copied to clipboard!');
  };

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Blue Header with Cover */}
        <div 
          className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900"
          style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {/* Geometric Pattern Overlay */}
          <div className={`absolute inset-0 ${coverImage ? 'bg-black/30' : 'opacity-20'}`}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 2px, transparent 2px),
                                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 2px, transparent 2px),
                                linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 52%)`,
              backgroundSize: '50px 50px, 60px 60px, 30px 30px'
            }} />
          </div>
          
          {/* Change Cover Button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-700 border-white/20"
              onClick={() => {
                // Handle cover image change
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCoverImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Cover
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                  {/* Profile Picture */}
                  <div className="flex justify-center -mt-16">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800">
                        {profileImage &&
                        profileImage !== 'https://via.placeholder.com/80' ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#4F39F6] flex items-center justify-center text-white font-semibold text-3xl">
                            {userDetails.firstName?.[0] ||
                              userDetails.email?.[0] ||
                              'U'}
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-[#4F39F6] text-white rounded-full p-2 cursor-pointer hover:bg-[#3D2DC4] shadow-md">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('Image size must be less than 2MB');
                                return;
                              }
                              if (
                                !['image/jpeg', 'image/jpg', 'image/png'].includes(
                                  file.type,
                                )
                              ) {
                                alert('Only JPG, JPEG, and PNG files are allowed');
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
                        <Camera className="h-4 w-4" />
                      </label>
                    </div>
                  </div>

                  {/* Name and Company */}
                  <div className="text-center mt-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {userDetails.firstName || userDetails.lastName
                        ? `${userDetails.firstName} ${userDetails.lastName}`.trim()
                        : 'User Name'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {userDetails.role || 'Company Name'}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Opportunities applied
                      </span>
                      <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        32
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Opportunities won
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        26
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Current opportunities
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        6
                      </span>
                    </div>
                  </div>

                  {/* View Public Profile Button */}
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    View Public Profile
                  </Button>

                  {/* Public Profile URL */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Public Profile URL
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={publicProfileUrl}
                        readOnly
                        className="h-8 text-xs flex-1 bg-gray-50 dark:bg-slate-700"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Settings Form */}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? 'border-[#4F39F6] text-[#4F39F6] dark:text-[#4F39F6]'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('integrations' as SettingsTab)}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'integrations'
                          ? 'border-[#4F39F6] text-[#4F39F6] dark:text-[#4F39F6]'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      Company Settings
                    </button>
                  )}
                </div>

                {/* Form Content */}
                <div>{renderContent()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsLogoutOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SettingsPage;
