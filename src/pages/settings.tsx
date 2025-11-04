import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authentication/login';
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
import { Plus, ChevronUp, MoreVertical } from 'lucide-react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';

// Type definitions for country/state/city (matching react-country-state-city structure)
type Country = {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
};

type State = {
  id: number;
  name: string;
  country_id?: number;
  state_code?: string;
};

type City = {
  id: number;
  name: string;
  state_id?: number;
  country_id?: number;
};
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SettingsTab =
  | 'my-details'
  | 'profile'
  | 'password'
  | 'team'
  | 'billings'
  | 'plan'
  | 'email'
  | 'notifications';

const SettingsPage: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<SettingsTab>('billings');
  const [passwordSubTab, setPasswordSubTab] = useState<'change' | 'reset'>(
    'change',
  );
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
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
    }
  }, [user]);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await GetCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (selectedCountry) {
        setLoadingStates(true);
        try {
          const data = await GetState(selectedCountry.id);
          setStates(data);
        } catch (error) {
          console.error('Failed to load states:', error);
          setStates([]);
        } finally {
          setLoadingStates(false);
        }
      } else {
        setStates([]);
      }
      setSelectedState(null);
      setSelectedCity(null);
    };
    loadStates();
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (selectedState && selectedCountry) {
        setLoadingCities(true);
        try {
          const data = await GetCity(selectedCountry.id, selectedState.id);
          setCities(data);
        } catch (error) {
          console.error('Failed to load cities:', error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      } else {
        setCities([]);
      }
      setSelectedCity(null);
    };
    loadCities();
  }, [selectedState, selectedCountry]);

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

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'my-details', label: 'My details' },
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'team', label: 'Team' },
    { id: 'billings', label: 'Billings' },
    { id: 'plan', label: 'Plan' },
    { id: 'email', label: 'Email' },
    { id: 'notifications', label: 'Notifications' },
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
                          mobileCountryCode:
                            match[1] || userDetails.mobileCountryCode,
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
                    placeholder={
                      loadingCities
                        ? 'Loading...'
                        : !selectedState
                          ? 'Select State first'
                          : 'Select City'
                    }
                    searchPlaceholder="Search cities..."
                    emptyMessage={
                      selectedState ? 'No cities found' : 'Select a state first'
                    }
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
                    placeholder={
                      loadingStates
                        ? 'Loading...'
                        : !selectedCountry
                          ? 'Select Country first'
                          : 'Select State'
                    }
                    searchPlaceholder="Search states..."
                    emptyMessage={
                      selectedCountry
                        ? 'No states found'
                        : 'Select a country first'
                    }
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
                    placeholder={
                      loadingCountries ? 'Loading...' : 'Select Country'
                    }
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
      case 'billings':
        return renderBillings();
      case 'profile':
        return renderProfile();
      case 'team':
        return renderTeam();
      case 'plan':
        return renderPlan();
      case 'email':
        return renderEmail();
      default:
        return null;
    }
  };

  // Render Billings Tab
  const renderBillings = () => {
    const [cardName, setCardName] = useState('Mayad Ahmed');
    const [cardExpiry, setCardExpiry] = useState('02 / 2028');
    const [cardNumber, setCardNumber] = useState('8269 9620 9292 2538');
    const [cvv, setCvv] = useState('****');
    const [contactEmail, setContactEmail] = useState('existing');
    const [newEmail, setNewEmail] = useState('');

    const billingHistory = [
      {
        id: 1,
        invoice: 'Account Sale',
        date: 'Apr 14, 2004',
        amount: '$3,050',
        status: 'Pending',
        statusColor:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        tracking: 'LM580405575CN',
        address: '313 Main Road, Sunderland.',
      },
      {
        id: 2,
        invoice: 'Account Sale',
        date: 'Jun 24, 2008',
        amount: '$1,050',
        status: 'Cancelled',
        statusColor:
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        tracking: 'AZ938540353US',
        address: '96 Grange Road, Peterborough.',
      },
    ];

    return (
      <div className="space-y-8">
        {/* Payment Method Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payment Method
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update your billing details and address.
            </p>
          </div>

          {/* Card Details */}
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Card Details
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Update your billing details and address.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another card
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="h-11 pl-12 pr-4"
                    placeholder="0000 0000 0000 0000"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <div className="w-8 h-5 bg-gradient-to-r from-orange-500 to-red-600 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name and Expiry Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name on your Card
                  </label>
                  <Input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-11"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry
                  </label>
                  <Input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="h-11"
                    placeholder="MM / YY"
                  />
                </div>
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV
                </label>
                <Input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="h-11"
                  placeholder="***"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact email Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Contact email
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Where should invoices be sent?
            </p>
          </div>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="existing-email"
                  name="contact-email"
                  value="existing"
                  checked={contactEmail === 'existing'}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6]"
                />
                <div className="flex-1">
                  <label
                    htmlFor="existing-email"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    Send to the existing email
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {userDetails.email || 'mayadahmed@ofspace.co'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  id="new-email"
                  name="contact-email"
                  value="new"
                  checked={contactEmail === 'new'}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6]"
                />
                <div className="flex-1">
                  <label
                    htmlFor="new-email"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer mb-2"
                  >
                    Add another email address
                  </label>
                  {contactEmail === 'new' && (
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-10"
                      placeholder="Enter email address"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing History Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Billing History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              See the transaction you made.
            </p>
          </div>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Invoice
                          <ChevronUp className="h-3 w-3 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Date
                          <ChevronUp className="h-3 w-3 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Amount
                          <ChevronUp className="h-3 w-3 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Status
                          <ChevronUp className="h-3 w-3 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Tracking & Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {billingHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {item.invoice}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.date}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.amount}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.statusColor}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div>{item.tracking}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {item.address}
                              </div>
                            </div>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Render other tabs
  const renderProfile = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Profile
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Profile settings coming soon.
      </p>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Team
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Team settings coming soon.
      </p>
    </div>
  );

  const renderPlan = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Plan
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Plan settings coming soon.
      </p>
    </div>
  );

  const renderEmail = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Email
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Email settings coming soon.
      </p>
    </div>
  );

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 lg:p-6">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Tabs Navigation */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#4F39F6] text-[#4F39F6] dark:text-[#4F39F6]'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {renderContent()}
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
              <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
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
