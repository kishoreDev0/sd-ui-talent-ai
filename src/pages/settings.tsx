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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, Camera, X, Edit2, Save, Loader2, Info, Settings, Shield, Bell, User, Users, CreditCard, MapPin } from 'lucide-react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { parsePhoneNumber } from 'react-phone-number-input';

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

type SettingsTab = 'general-information' | 'preferences' | 'security' | 'notifications' | 'account' | 'account-manager' | 'billings';

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
              className="h-8 text-sm w-full"
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
              className="h-8 text-sm w-full"
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
              className="h-8 text-sm w-full"
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('general-information');
  const [businessName, setBusinessName] = useState('');
  const [fax, setFax] = useState('');

  // Initialize business name from user organizations
  useEffect(() => {
    if (user?.organizations && user.organizations.length > 0 && !businessName) {
      setBusinessName(user.organizations[0].name || '');
    }
  }, [user?.organizations, businessName]);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalUserDetails, setOriginalUserDetails] = useState({
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
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState<string>('');
  const [originalSelectedCountry, setOriginalSelectedCountry] =
    useState<Country | null>(null);
  const [originalSelectedState, setOriginalSelectedState] =
    useState<State | null>(null);
  const [originalSelectedCity, setOriginalSelectedCity] = useState<City | null>(
    null,
  );
  const [originalAvatarPreview, setOriginalAvatarPreview] =
    useState<string>('');
  const [originalAvatarFile, setOriginalAvatarFile] = useState<File | null>(
    null,
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
      const initialUserDetails = {
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
      };
      setUserDetails(initialUserDetails);
      setOriginalUserDetails(initialUserDetails);
      setOriginalPhoneNumber(fullPhoneNumber);
      setAvatarPreview(imageUrl);
      setOriginalAvatarPreview(imageUrl);
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
        setOriginalSelectedCountry(foundCountry);
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
        setOriginalSelectedState(foundState);
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
        setOriginalSelectedCity(foundCity);
      }
    }
  }, [cities, userDetails.cityId, selectedState, selectedCity]);

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general-information', label: 'General Information', icon: <Info className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'account-manager', label: 'Account Manager', icon: <Users className="w-4 h-4" /> },
    { id: 'billings', label: 'Billings', icon: <CreditCard className="w-4 h-4" /> },
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
      const payload: Record<string, unknown> = {
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
        const uploadFormData = new FormData();
        Object.keys(payload).forEach((key) => {
          uploadFormData.append(key, String(payload[key]));
        });
        uploadFormData.append('image', avatarFile);

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
        // Update original values to match the saved values
        setOriginalUserDetails({ ...userDetails });
        setOriginalPhoneNumber(phoneNumber);
        setOriginalSelectedCountry(selectedCountry);
        setOriginalSelectedState(selectedState);
        setOriginalSelectedCity(selectedCity);
        setOriginalAvatarPreview(avatarPreview);
        setOriginalAvatarFile(null);
        setIsEditing(false); // Exit edit mode after successful update
      } else {
        showToast(result?.error?.[0] || 'Failed to update profile', 'error');
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { payload?: { message?: string }; message?: string })?.payload
          ?.message ||
        (err as { message?: string })?.message ||
        'Failed to update profile. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (_formData: {
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
        showToast(
          (result as { error?: string })?.error || 'Failed to send reset email',
          'error',
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { payload?: { message?: string }; message?: string })?.payload
          ?.message ||
        (err as { message?: string })?.message ||
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

  const handleEdit = () => {
    // Save current values as original before editing
    setOriginalUserDetails({ ...userDetails });
    setOriginalPhoneNumber(phoneNumber);
    setOriginalSelectedCountry(selectedCountry);
    setOriginalSelectedState(selectedState);
    setOriginalSelectedCity(selectedCity);
    setOriginalAvatarPreview(avatarPreview);
    setOriginalAvatarFile(avatarFile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Restore original values
    setUserDetails({ ...originalUserDetails });
    setPhoneNumber(originalPhoneNumber);
    setSelectedCountry(originalSelectedCountry);
    setSelectedState(originalSelectedState);
    setSelectedCity(originalSelectedCity);
    setAvatarPreview(originalAvatarPreview);
    setAvatarFile(originalAvatarFile);
    setIsEditing(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general-information':
        return (
          <div className="space-y-8">
            {/* Section Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                General Information
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Update your profile and organization details
              </p>
            </div>

            <form className="space-y-5">
              {/* Profile Picture Upload Section */}
              <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Profile Picture
                </h3>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
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
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#4F39F6] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <MapPin className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {userDetails.firstName && userDetails.lastName
                          ? `${userDetails.firstName} ${userDetails.lastName}`
                          : userDetails.firstName ||
                            userDetails.lastName ||
                            user?.email?.split('@')[0] ||
                            'User'}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {user?.role?.name || user?.role?.display_name || userDetails.role || 'No role assigned'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {selectedCity?.name || selectedState?.name || selectedCountry?.name || userDetails.city || userDetails.state || userDetails.country || 'No location set'}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={!isEditing}
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          type="button"
                          disabled={!isEditing}
                          className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white h-8 px-3 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Upload New Photo
                        </Button>
                      </label>
                      {isEditing && avatarPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveAvatar}
                          className="border-[#4F39F6] text-[#4F39F6] hover:bg-[#4F39F6] hover:text-white h-8 px-3 text-xs"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Information Section */}
              <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Organization Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Business Name
                    </label>
                    <Input
                      placeholder={user?.organizations?.[0]?.name || "Enter business name"}
                      className="h-9 text-xs w-full"
                      value={businessName || user?.organizations?.[0]?.name || ''}
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      className="h-9 text-xs w-full"
                      value={userDetails.email || user?.email || ''}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          email: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={phoneNumber || (userDetails.mobileCountryCode && userDetails.phone ? `${userDetails.mobileCountryCode}${userDetails.phone}` : '')}
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
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Fax
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Enter fax number"
                        className="h-9 text-xs w-full pr-10"
                        value={fax}
                        onChange={(e) => setFax(e.target.value)}
                        disabled={!isEditing}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                      disabled={!isEditing || loadingCountries}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                      disabled={!isEditing || !selectedState || loadingCities}
                      loading={loadingCities}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Postcode
                    </label>
                    <Input
                      placeholder="Enter postcode"
                      className="h-9 text-xs w-full"
                      value={userDetails.zipCode}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          zipCode: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      State
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
                      disabled={!isEditing || !selectedCountry || loadingStates}
                      loading={loadingStates}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Preferences
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your preferences and settings.
              </p>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Preferences section coming soon...
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Security
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your security settings.
              </p>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Security section coming soon...
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Notifications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your notification preferences.
              </p>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Notifications section coming soon...
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your account settings.
              </p>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Account section coming soon...
            </div>
          </div>
        );
      case 'account-manager':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Account Manager
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your account managers.
              </p>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Account Manager section coming soon...
            </div>
          </div>
        );
      case 'billings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Billings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your billing information.
              </p>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Billings section coming soon...
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Settings
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Manage your account settings and preferences
              </p>
            </div>
            {/* Top Right Action Buttons - Only show when NOT editing (Edit button) or when editing (Cancel/Save) */}
            <div className="flex items-center gap-3">
              {!isEditing ? (
                  <Button
                    type="button"
                    onClick={handleEdit}
                    disabled={isSaving || userLoading}
                    className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white h-8 px-3 text-xs"
                  >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving || userLoading}
                    className="border-[#4F39F6] text-[#4F39F6] hover:bg-[#4F39F6] hover:text-white h-8 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isSaving || userLoading}
                    className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white h-8 px-3 text-xs"
                  >
                    {isSaving || userLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </>
              )}
            </div>
        </div>

          {/* Main Content - Sidebar + Content Area */}
          <div className="flex gap-4">
            {/* Left Sidebar Navigation */}
            <div className="w-56 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
              <nav className="space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#4F39F6] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
            >
                    <span className={activeTab === tab.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
                      {tab.icon}
                    </span>
              {tab.label}
            </button>
          ))}
              </nav>
        </div>

            {/* Right Content Area */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              {renderContent()}
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
