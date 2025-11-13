import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch } from '@/store';
import { updateUserOnboarding } from '@/store/action/authentication/onboarding';

// Type definitions
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

// Timezone options
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)' },
  { value: 'America/Denver', label: 'America/Denver (MST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT)' },
];

// Mobile country codes
const MOBILE_COUNTRY_CODES = [
  { value: '+1', label: '+1 (US/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+34', label: '+34 (Spain)' },
];

// Validation schema
const onboardingSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  preferred_timezone: z.string().min(1, 'Preferred timezone is required'),
  mobile_country_code: z.string().min(1, 'Mobile country code is required'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  image_url: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingStepperProps {
  userId: number;
  onComplete: () => void;
}

const toErrorMessage = (error: unknown, fallback: string): string => {
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
  }

  return fallback;
};

const steps = [
  {
    id: 1,
    label: 'Location Information',
    description: 'Enter your location details',
  },
  {
    id: 2,
    label: 'Contact Information',
    description: 'Add your contact details',
  },
  { id: 3, label: 'Preferences', description: 'Set your preferences' },
  { id: 4, label: 'Review', description: 'Review and confirm' },
];

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  userId,
  onComplete,
}) => {
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      city: '',
      state: '',
      zip_code: '',
      country: '',
      preferred_timezone: '',
      mobile_country_code: '+1',
      mobile_number: '',
      image_url: '',
    },
  });

  const formValues = watch();

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const countriesData = await GetCountries();
        setCountries(countriesData as Country[]);
      } catch (error) {
        console.error('Error loading countries:', error);
        showToast('Failed to load countries', 'error');
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, [showToast]);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const loadStates = async () => {
        setLoadingStates(true);
        try {
          const statesData = await GetState(selectedCountry.id);
          setStates(statesData as State[]);
          setSelectedState(null);
          setCities([]);
        } catch (error) {
          console.error('Error loading states:', error);
          showToast('Failed to load states', 'error');
        } finally {
          setLoadingStates(false);
        }
      };
      loadStates();
    }
  }, [selectedCountry, showToast]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState && selectedCountry) {
      const loadCities = async () => {
        setLoadingCities(true);
        try {
          const citiesData = await GetCity(
            selectedCountry.id,
            selectedState.id,
          );
          setCities(citiesData as City[]);
          setSelectedCity(null);
        } catch (error) {
          console.error('Error loading cities:', error);
          showToast('Failed to load cities', 'error');
        } finally {
          setLoadingCities(false);
        }
      };
      loadCities();
    }
  }, [selectedState, selectedCountry, showToast]);

  // Update form values when selections change
  useEffect(() => {
    if (selectedCountry) {
      setValue('country', selectedCountry.name, { shouldValidate: true });
    }
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (selectedState) {
      setValue('state', selectedState.name, { shouldValidate: true });
    }
  }, [selectedState, setValue]);

  useEffect(() => {
    if (selectedCity) {
      setValue('city', selectedCity.name, { shouldValidate: true });
    }
  }, [selectedCity, setValue]);

  const handleNext = async () => {
    // Validate current step fields
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger(['country', 'state', 'city', 'zip_code']);
    } else if (currentStep === 2) {
      isValid = await trigger(['mobile_country_code', 'mobile_number']);
    } else if (currentStep === 3) {
      isValid = await trigger(['preferred_timezone']);
    }

    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        updateUserOnboarding({
          userId,
          payload: data,
          api: httpClient,
        }),
      ).unwrap();

      showToast('Onboarding completed successfully!', 'success');
      onComplete();
    } catch (err) {
      console.error('Onboarding failed:', err);
      const errorMessage = toErrorMessage(err, 'Failed to complete onboarding');
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#4F39F6] mb-2">
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={countries.map((c) => ({
                    value: c.id.toString(),
                    label: c.name,
                  }))}
                  value={selectedCountry?.id.toString() || ''}
                  onValueChange={(value) => {
                    const country = countries.find(
                      (c) => c.id.toString() === value,
                    );
                    setSelectedCountry(country || null);
                  }}
                  placeholder="Select Country"
                  loading={loadingCountries}
                  className={errors.country ? 'border-red-300' : ''}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={states.map((s) => ({
                    value: s.id.toString(),
                    label: s.name,
                  }))}
                  value={selectedState?.id.toString() || ''}
                  onValueChange={(value) => {
                    const state = states.find((s) => s.id.toString() === value);
                    setSelectedState(state || null);
                  }}
                  placeholder="Select State"
                  loading={loadingStates}
                  disabled={!selectedCountry}
                  className={errors.state ? 'border-red-300' : ''}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={cities.map((c) => ({
                    value: c.id.toString(),
                    label: c.name,
                  }))}
                  value={selectedCity?.id.toString() || ''}
                  onValueChange={(value) => {
                    const city = cities.find((c) => c.id.toString() === value);
                    setSelectedCity(city || null);
                  }}
                  placeholder="Select City"
                  loading={loadingCities}
                  disabled={!selectedState}
                  className={errors.city ? 'border-red-300' : ''}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('zip_code')}
                  placeholder="Enter zip code"
                  className={errors.zip_code ? 'border-red-300' : ''}
                />
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.zip_code.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#4F39F6] mb-2">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Country Code <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={MOBILE_COUNTRY_CODES}
                  value={formValues.mobile_country_code}
                  onValueChange={(value) =>
                    setValue('mobile_country_code', value, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select Country Code"
                  className={errors.mobile_country_code ? 'border-red-300' : ''}
                />
                {errors.mobile_country_code && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.mobile_country_code.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('mobile_number')}
                  placeholder="Enter mobile number"
                  className={errors.mobile_number ? 'border-red-300' : ''}
                />
                {errors.mobile_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.mobile_number.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#4F39F6] mb-2">
              Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Timezone <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={TIMEZONES}
                  value={formValues.preferred_timezone}
                  onValueChange={(value) =>
                    setValue('preferred_timezone', value, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select Timezone"
                  className={errors.preferred_timezone ? 'border-red-300' : ''}
                />
                {errors.preferred_timezone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.preferred_timezone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL (Optional)
                </label>
                <Input
                  {...register('image_url')}
                  placeholder="Enter image URL"
                  type="url"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#4F39F6] mb-2">
              Review & Confirm
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-semibold">{formValues.country || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">State</p>
                  <p className="font-semibold">{formValues.state || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-semibold">{formValues.city || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zip Code</p>
                  <p className="font-semibold">{formValues.zip_code || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mobile</p>
                  <p className="font-semibold">
                    {formValues.mobile_country_code}{' '}
                    {formValues.mobile_number || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timezone</p>
                  <p className="font-semibold">
                    {formValues.preferred_timezone || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left Side - Steps UI */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Example with Steps UI
              </h1>
              <p className="text-sm text-gray-600">
                Follow the simple 4 Steps to complete your mapping.
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isActive = currentStep === step.id;
                const isPast = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                              ? 'bg-[#4F39F6] text-white'
                              : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-0.5 h-16 mt-2 ${
                            isCompleted || isPast
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-1">
                      <h3
                        className={`font-semibold mb-1 ${
                          isActive ? 'text-[#4F39F6]' : 'text-gray-700'
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Form Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Prev
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
