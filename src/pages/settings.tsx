import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authentication/login';
import { updateUser } from '@/store/user/actions/userActions';
import { forgotPassword } from '@/store/action/authentication/forgotPassword';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Plus,
  ChevronUp,
  MoreVertical,
  Upload,
  Camera,
  Check,
  X,
} from 'lucide-react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';
import { z } from 'zod';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  parsePhoneNumber,
  getCountryCallingCode,
} from 'react-phone-number-input';

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

type SettingsTab = 'my-details' | 'password';

// Change Password Form Component
const ChangePasswordFormComponent: React.FC<{
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Change Password</CardTitle>
        <CardDescription className="text-[10px]">
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <Input
              type="password"
              placeholder="Enter current password"
              className="h-10 text-sm w-full"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-600">{errors.currentPassword}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <Input
              type="password"
              placeholder="Enter new password"
              className="h-10 text-sm w-full"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
            />
            {errors.newPassword && (
              <p className="text-xs text-red-600">{errors.newPassword}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <Input
              type="password"
              placeholder="Confirm new password"
              className="h-10 text-sm w-full"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" className="h-8 px-3 text-xs">
              Update Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const SettingsPage: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const { showToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const { loading: userLoading } = useAppSelector((state) => state.user);
  const { isLoading: forgotPasswordLoading } = useAppSelector(
    (state) => state.forgotPassword,
  );
  const [activeTab, setActiveTab] = useState<SettingsTab>('my-details');
  const [passwordSubTab, setPasswordSubTab] = useState<'change' | 'reset'>(
    'change',
  );
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    imageUrl: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
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
      const imageUrl = userData.image_url || userData.imageUrl || '';
      const phone = userData.phone || userData.phone_number || '';
      const mobileCountryCode =
        userData.mobile_country_code || userData.mobileCountryCode || '+1';

      // Construct full phone number in international format
      const fullPhoneNumber = phone
        ? mobileCountryCode && !phone.startsWith('+')
          ? `${mobileCountryCode}${phone}`
          : phone
        : '';

      setPhoneNumber(fullPhoneNumber);
      setUserDetails({
        firstName: userData.first_name || userData.firstName || '',
        lastName: userData.last_name || userData.lastName || '',
        email: userData.email || '',
        phone: phone,
        mobileCountryCode: mobileCountryCode,
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
        imageUrl: imageUrl,
      });
      setAvatarPreview(imageUrl);
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
    { id: 'password', label: 'Password' },
  ];

  const handleLogout = () => {
    try {
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) {
      showToast('User not found. Please log in again.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        first_name: userDetails.firstName,
        last_name: userDetails.lastName,
        email: userDetails.email,
        mobile_number: userDetails.phone,
        mobile_country_code: userDetails.mobileCountryCode,
        city: selectedCity?.name || userDetails.city,
        state: selectedState?.name || userDetails.state,
        country: selectedCountry?.name || userDetails.country,
        zip_code: userDetails.zipCode,
        preferred_timezone: userDetails.preferredTimeZone,
      };

      // If a new avatar file was selected, include it in the payload
      if (avatarFile) {
        // Create FormData for file upload
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          formData.append(key, payload[key]);
        });
        formData.append('image', avatarFile);

        // TODO: Update this to use the actual API endpoint for file upload
        // For now, if the API supports image_url, we'll send it as base64 or URL
        // You may need to upload the file separately first and get the URL
        if (avatarPreview && avatarPreview.startsWith('data:')) {
          // If it's a data URL from file upload, you might need to convert it
          // This depends on your API implementation
          payload.image_url = avatarPreview;
        }
      } else if (userDetails.imageUrl) {
        payload.image_url = userDetails.imageUrl;
      }

      const result = await dispatch(
        updateUser({ id: user.id, payload }),
      ).unwrap();

      if (result?.success) {
        showToast('Profile updated successfully!', 'success');
        // Update local user data
        const updatedUser = { ...user, ...result.data };
        if (result.data?.image_url) {
          updatedUser.image_url = result.data.image_url;
          setAvatarPreview(result.data.image_url);
          setUserDetails({
            ...userDetails,
            imageUrl: result.data.image_url,
          });
        }
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAvatarFile(null); // Clear the file after successful upload
      } else {
        showToast(result?.error?.[0] || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      const errorMessage =
        err?.payload?.message ||
        err?.message ||
        'Failed to update profile. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (formData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // TODO: Implement password change API call
    showToast('Password change functionality will be implemented soon', 'info');
  };

  const handleForgotPassword = async () => {
    if (!userDetails.email) {
      showToast('Email is required', 'error');
      return;
    }

    try {
      const result = await dispatch(
        forgotPassword({
          forgotPayload: { email: userDetails.email },
          api: httpClient,
        }),
      ).unwrap();

      if (result?.status === 'success') {
        showToast(
          'Password reset email sent! Please check your inbox.',
          'success',
        );
      } else {
        showToast(result?.error || 'Failed to send reset email', 'error');
      }
    } catch (err: any) {
      const errorMessage =
        err?.payload?.message ||
        err?.message ||
        'Failed to send password reset email. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setUserDetails({
      ...userDetails,
      imageUrl: '',
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'my-details':
        return (
          <div className="space-y-6">
            <form className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    JPG, PNG or GIF. Max size of 5MB
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs cursor-pointer"
                      >
                        <Upload className="w-3 h-3 mr-1.5" />
                        Upload Photo
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* First Row - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Second Row - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value || '');
                      if (value) {
                        try {
                          const phoneNumberObj = parsePhoneNumber(value);
                          if (phoneNumberObj) {
                            setUserDetails({
                              ...userDetails,
                              mobileCountryCode: `+${phoneNumberObj.countryCallingCode}`,
                              phone: phoneNumberObj.nationalNumber,
                            });
                          }
                        } catch (error) {
                          // If parsing fails, just store the value
                          console.error('Error parsing phone number:', error);
                        }
                      } else {
                        setUserDetails({
                          ...userDetails,
                          phone: '',
                          mobileCountryCode: '+1',
                        });
                      }
                    }}
                    className="phone-input-container"
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

              {/* Third Row - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Preferred Timezone
                  </label>
                  <Input
                    type="text"
                    value={userDetails.preferredTimeZone}
                    onChange={(e) =>
                      setUserDetails({
                        ...userDetails,
                        preferredTimeZone: e.target.value,
                      })
                    }
                    className="h-10 text-sm w-full"
                    placeholder="e.g., UTC, America/New_York"
                  />
                </div>
              </div>

              {/* Update Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={isSaving || userLoading}
                  className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white px-6 py-2 h-10 text-sm font-medium disabled:opacity-50"
                >
                  {isSaving || userLoading ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </div>
        );
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
              <ChangePasswordFormComponent onSubmit={handleChangePassword} />
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
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordLoading}
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 ">
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
