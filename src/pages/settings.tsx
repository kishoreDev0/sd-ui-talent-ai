import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authentication/login';
import { updateSelfProfile } from '@/store/user/actions/userActions';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ResetPassword from '@/components/reset-password';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { forgotPassword } from '@/store/action/authentication/forgotPassword';
import {
  Camera,
  Edit2,
  Loader2,
  Info,
  Bell,
  MapPin,
  Lock,
  Mail,
} from 'lucide-react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { parsePhoneNumber } from 'react-phone-number-input';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SettingsTab = 'general-information' | 'password' | 'notifications';

type Country = {
  id: number;
  name: string;
  iso2?: string;
  iso3?: string;
};

type State = {
  id: number;
  name: string;
};

type City = {
  id: number;
  name: string;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const direct = record.error;
    const message = record.message;
    const responseData = (record.response as Record<string, unknown>)?.data as
      | Record<string, unknown>
      | undefined;

    if (typeof direct === 'string') {
      return direct;
    }

    if (Array.isArray(direct) && direct.length > 0) {
      return direct
        .filter((item): item is string => typeof item === 'string')
        .join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }

    if (responseData) {
      const responseError = responseData.error;
      const responseMessage = responseData.message;

      if (typeof responseError === 'string') {
        return responseError;
      }

      if (Array.isArray(responseError) && responseError.length > 0) {
        return responseError
          .filter((item): item is string => typeof item === 'string')
          .join(', ');
      }

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }
    }
  }

  return fallback;
};

const SettingsPage: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const { loading: userLoading } = useAppSelector((state) => state.user);
  const { isLoading: forgotPasswordLoading, error: forgotPasswordError } =
    useAppSelector((state) => state.forgotPassword);
  const { httpClient } = initializeHttpClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    'general-information',
  );
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
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const displayLocation =
    selectedCity?.name ||
    selectedState?.name ||
    selectedCountry?.name ||
    userDetails.city ||
    userDetails.state ||
    userDetails.country ||
    '';

  const handleSendResetLink = async () => {
    if (!forgotEmail.trim()) {
      showToast(
        'Please enter an email address to send the reset link.',
        'error',
      );
      return;
    }
    try {
      await dispatch(
        forgotPassword({
          forgotPayload: { email: forgotEmail.trim() },
          api: httpClient,
        }),
      ).unwrap();
      showToast(
        'Password reset email sent successfully. Please check your inbox.',
        'success',
      );
    } catch (error) {
      const message = extractErrorMessage(
        error,
        'Failed to send password reset email.',
      );
      showToast(message, 'error');
    }
  };

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

  useEffect(() => {
    if (userDetails.email) {
      setForgotEmail(userDetails.email);
    } else if (user?.email) {
      setForgotEmail(user.email);
    }
  }, [userDetails.email, user?.email]);

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
    {
      id: 'general-information',
      label: 'General Information',
      icon: <Info className="w-4 h-4" />,
    },
    {
      id: 'password',
      label: 'Password',
      icon: <Lock className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
    },
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
      const formData = new FormData();
      const appendIfValue = (key: string, value?: string | null) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ''
        ) {
          formData.append(key, value);
        }
      };

      appendIfValue('first_name', userDetails.firstName);
      appendIfValue('last_name', userDetails.lastName);
      appendIfValue('email', userDetails.email);
      appendIfValue('mobile_number', userDetails.phone);
      appendIfValue('mobile_country_code', userDetails.mobileCountryCode);
      appendIfValue('city', selectedCity?.name || userDetails.city);
      appendIfValue('state', selectedState?.name || userDetails.state);
      appendIfValue('country', selectedCountry?.name || userDetails.country);
      appendIfValue('zip_code', userDetails.zipCode);
      appendIfValue('preferred_timezone', userDetails.preferredTimeZone);

      if (avatarFile) {
        formData.append('profile_pic', avatarFile);
      }

      const result = await dispatch(updateSelfProfile(formData)).unwrap();

      if (result?.success) {
        showToast('Profile updated successfully!', 'success');
        const updatedUserFromApi = result.data;

        const updatedPhoneNumber = updatedUserFromApi.mobile_number
          ? `${updatedUserFromApi.mobile_country_code || ''}${updatedUserFromApi.mobile_number}`
          : '';

        const matchedCountry =
          countries.find((c) => c.name === updatedUserFromApi.country) || null;
        const matchedState =
          states.find((s) => s.name === updatedUserFromApi.state) || null;
        const matchedCity =
          cities.find((c) => c.name === updatedUserFromApi.city) || null;

        const updatedDetails = {
          firstName: updatedUserFromApi.first_name || '',
          lastName: updatedUserFromApi.last_name || '',
          email: updatedUserFromApi.email || '',
          phone: updatedUserFromApi.mobile_number || '',
          mobileCountryCode: updatedUserFromApi.mobile_country_code || '+1',
          birthday: userDetails.birthday,
          bio: userDetails.bio,
          city: updatedUserFromApi.city || '',
          state: updatedUserFromApi.state || '',
          zipCode: updatedUserFromApi.zip_code || '',
          country: updatedUserFromApi.country || '',
          countryId: matchedCountry?.id
            ? String(matchedCountry.id)
            : userDetails.countryId,
          stateId: matchedState?.id
            ? String(matchedState.id)
            : userDetails.stateId,
          cityId: matchedCity?.id ? String(matchedCity.id) : userDetails.cityId,
          preferredTimeZone: updatedUserFromApi.preferred_timezone || '',
          isActive: updatedUserFromApi.is_active ?? userDetails.isActive,
          lastLogin: updatedUserFromApi.last_login || userDetails.lastLogin,
          role: updatedUserFromApi.role?.name || userDetails.role,
          imageUrl: updatedUserFromApi.image_url || userDetails.imageUrl,
        };

        setUserDetails(updatedDetails);
        setAvatarPreview(updatedDetails.imageUrl || avatarPreview);
        setAvatarFile(null);
        setPhoneNumber(updatedPhoneNumber);
        setSelectedCountry(matchedCountry);
        setSelectedState(matchedState);
        setSelectedCity(matchedCity);

        const updatedUser = { ...user, ...updatedUserFromApi };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setOriginalUserDetails(updatedDetails);
        setOriginalPhoneNumber(updatedPhoneNumber);
        setOriginalSelectedCountry(matchedCountry);
        setOriginalSelectedState(matchedState);
        setOriginalSelectedCity(matchedCity);
        setOriginalAvatarPreview(updatedDetails.imageUrl || avatarPreview);
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
          <div className="space-y-10">
            {/* Section Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  General Information
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update your profile and organization details
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={handleEdit}
                    disabled={isSaving || userLoading}
                    className="h-8 px-3 text-xs text-white bg-[#4F39F6] hover:bg-[#3D2DC4] sm:h-9 sm:px-4 sm:text-sm"
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving || userLoading}
                      className="h-8 px-3 text-xs border-[#4F39F6] text-[#4F39F6] hover:bg-[#4F39F6] hover:text-white sm:h-9 sm:px-4 sm:text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpdateProfile}
                      disabled={isSaving || userLoading}
                      className="h-8 px-3 text-xs text-white bg-[#4F39F6] hover:bg-[#3D2DC4] sm:h-9 sm:px-4 sm:text-sm"
                    >
                      {isSaving || userLoading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
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
            <form className="space-y-6">
              {/* Profile Picture Upload Section */}
              <div className="space-y-2 border-b border-gray-200 pb-3 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Profile Picture
                  </h3>
                  <div className="flex items-center gap-2">
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
                        className="h-8 cursor-pointer px-3 text-xs text-white bg-[#4F39F6] hover:bg-[#3D2DC4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:px-4 sm:text-sm"
                      >
                        Upload New Photo
                      </Button>
                    </label>
                    {isEditing && avatarPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveAvatar}
                        className="h-8 px-3 text-xs border-[#4F39F6] text-[#4F39F6] hover:bg-[#4F39F6] hover:text-white sm:h-9 sm:px-4 sm:text-sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-200 dark:border-gray-600 dark:bg-gray-700 sm:h-18 sm:w-18">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
                          <Camera className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    {avatarPreview && (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#4F39F6] dark:border-slate-800">
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
                        {userDetails.firstName && userDetails.lastName
                          ? `${userDetails.firstName} ${userDetails.lastName}`
                          : userDetails.firstName ||
                            userDetails.lastName ||
                            user?.email?.split('@')[0] ||
                            'User'}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                        {user?.role?.name ||
                          user?.role?.display_name ||
                          userDetails.role ||
                          'No role assigned'}
                      </p>
                      {displayLocation && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {displayLocation}
                        </p>
                      )}
                      {user?.email && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Information Section */}
              <div className="space-y-3 border-b border-gray-200 pb-3 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Organization Information
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Business Name
                    </label>
                    <Input
                      placeholder={
                        user?.organizations?.[0]?.name || 'Enter business name'
                      }
                      className="h-9 w-full text-sm"
                      value={
                        businessName || user?.organizations?.[0]?.name || ''
                      }
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      className="h-9 w-full text-sm"
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
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={
                        phoneNumber ||
                        (userDetails.mobileCountryCode && userDetails.phone
                          ? `${userDetails.mobileCountryCode}${userDetails.phone}`
                          : '')
                      }
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
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fax
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Enter fax number"
                        className="h-9 w-full pr-10 text-sm"
                        value={fax}
                        onChange={(e) => setFax(e.target.value)}
                        disabled={!isEditing}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Address
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        selectedState
                          ? 'No cities found'
                          : 'Select a state first'
                      }
                      disabled={!isEditing || !selectedState || loadingCities}
                      loading={loadingCities}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Postcode
                    </label>
                    <Input
                      placeholder="Enter postcode"
                      className="h-9 w-full text-sm"
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
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
      case 'password':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Password Management
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Change your current password or send a reset link to your email.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Lock className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Change Password
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use this option to set a new password while you are logged in.
                </p>
                <Button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(true)}
                  className="h-9 w-full sm:w-auto bg-[#4F39F6] hover:bg-[#3D2DC4] text-white text-sm"
                >
                  Reset Password
                </Button>
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Reset Link
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We will email a password reset link to the address below.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="Enter email address"
                    className="h-9 w-full text-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleSendResetLink}
                    disabled={forgotPasswordLoading}
                    className="h-9 w-full sm:w-auto bg-[#4F39F6] hover:bg-[#3D2DC4] text-white text-sm disabled:opacity-60"
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
                {forgotPasswordError && (
                  <p className="text-xs text-red-500">
                    {typeof forgotPasswordError === 'string'
                      ? forgotPasswordError
                      : 'Unable to send reset link. Please try again.'}
                  </p>
                )}
              </div>
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
      default:
        return null;
    }
  };

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-transparent">
        <div className="relative z-10 mx-auto w-full max-w-5xl ">
          {/* Header Section */}
          <div className="mb-4 flex items-start justify-between sm:mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                Settings
              </h1>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 sm:mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            {/* Top Right Action Buttons - Only show when NOT editing (Edit button) or when editing (Cancel/Save) */}
            <div className="hidden" />
          </div>

          {/* Main Content - Sidebar + Content Area */}
          <div className="flex gap-6">
            {/* Left Sidebar Navigation */}
            <div className="w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#4F39F6] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className={
                        activeTab === tab.id
                          ? 'text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <ResetPassword onClose={() => setIsResetPasswordOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="sm:max-w-md border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Confirm Logout
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-base text-gray-600 dark:text-gray-300">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsLogoutOpen(false)}
                className="border-gray-300 bg-white text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200"
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
