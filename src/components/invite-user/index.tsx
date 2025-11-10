import React, { useEffect, useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { resetInviteUserState } from '@/store/slices/authentication/inviteUser';
import { inviteUser } from '@/store/action/authentication/inviteUser';
import { getAllOrganizations } from '@/store/organization/actions/organizationActions';
import { getAllRole } from '@/store/role/actions/roleActions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronsUpDown, Search, X, CheckSquare2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GetCountries } from 'react-country-state-city';
import PhoneInput, { getCountryCallingCode } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { parsePhoneNumber } from 'react-phone-number-input';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { allTimezones } from 'react-timezone-select';
interface InviteUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inviteUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  organizations: z
    .array(z.string())
    .min(1, 'At least one organization is required'),
  role: z.string().min(1, 'Role is required'),
  country: z.string().min(1, 'Country is required'),
  phoneNumber: z.string().optional(),
  preferredTimeZone: z.string().min(1, 'Preferred timezone is required'),
});

// Helper function to filter timezones by country
const getTimezonesForCountry = (
  countryCode: string | null,
): typeof allTimezones => {
  if (!countryCode) return allTimezones;

  const countryTimezones: Record<string, string[]> = {
    US: ['America/'],
    CA: ['America/'],
    MX: ['America/'],
    BR: ['America/'],
    GB: ['Europe/London'],
    FR: ['Europe/Paris'],
    DE: ['Europe/Berlin'],
    IT: ['Europe/Rome'],
    ES: ['Europe/Madrid'],
    NL: ['Europe/Amsterdam'],
    GR: ['Europe/Athens'],
    RU: ['Europe/Moscow', 'Asia/'],
    IN: ['Asia/Kolkata'],
    CN: ['Asia/Shanghai'],
    JP: ['Asia/Tokyo'],
    KR: ['Asia/Seoul'],
    AU: ['Australia/'],
    NZ: ['Pacific/Auckland'],
    AE: ['Asia/Dubai'],
    PK: ['Asia/Karachi'],
    BD: ['Asia/Dhaka'],
    TH: ['Asia/Bangkok'],
    SG: ['Asia/Singapore'],
    HK: ['Asia/Hong_Kong'],
  };

  const timezonePrefixes = countryTimezones[countryCode.toUpperCase()];
  if (!timezonePrefixes) return allTimezones;

  const filtered: typeof allTimezones = {};
  Object.keys(allTimezones).forEach((tz) => {
    if (timezonePrefixes.some((prefix) => tz.startsWith(prefix))) {
      filtered[tz] = allTimezones[tz];
    }
  });

  // If no timezones found, return all timezones
  return Object.keys(filtered).length > 0 ? filtered : allTimezones;
};

type Country = {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
};

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

const InviteUserForm: React.FC<InviteUserFormProps> = ({
  open,
  onOpenChange,
}) => {
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const { isLoading, isSuccess, error } = useAppSelector(
    (state) => state.inviteUser,
  );
  const { organizations, loading: organizationsLoading } = useAppSelector(
    (state) => state.organization,
  );
  const { roles, loading: rolesLoading } = useAppSelector(
    (state) => state.role,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organizations: [],
      role: '',
      country: '',
      phoneNumber: '',
      preferredTimeZone: '',
    },
  });

  const selectedRole = watch('role');
  const selectedOrganizations = watch('organizations') || [];
  const selectedCountryId = watch('country');
  // Remove watch for preferredTimeZone as it's causing sync issues
  // Use getValues() directly when needed

  // Memoize filtered timezones based on selected country and convert to options array
  const timezoneOptions = useMemo(() => {
    const filteredTimezones = getTimezonesForCountry(
      selectedCountry?.iso2 || null,
    );
    return Object.keys(filteredTimezones)
      .sort()
      .map((tz) => ({
        value: tz,
        label:
          filteredTimezones[tz] || tz.replace(/_/g, ' ').replace(/\//g, ' / '),
      }));
  }, [selectedCountry?.iso2]);

  // Convert roles to options array for Combobox
  const roleOptions = useMemo(() => {
    return roles
      .filter((role) => role.active !== false && role.id != null)
      .map((role) => ({
        value: role.id?.toString() || '',
        label: role.name || '',
      }));
  }, [roles]);

  // Success toast is now handled in onSubmit after successful dispatch
  // This useEffect is kept as a fallback in case isSuccess changes
  useEffect(() => {
    if (isSuccess) {
      // Toast is already shown in onSubmit, but we can reset state here if needed
      reset();
      setTimeout(() => {
        onOpenChange(false);
        setToast(null);
        dispatch(resetInviteUserState());
      }, 2000);
    }
  }, [isSuccess, onOpenChange, reset, dispatch]);

  useEffect(() => {
    if (error) {
      setToast({
        message: error || 'Failed to send invitation. Please try again.',
        type: 'error',
      });
      setTimeout(() => setToast(null), 5000);
    }
  }, [error]);

  useEffect(() => {
    if (!open) {
      reset();
      setToast(null);
      dispatch(resetInviteUserState());
      setPhoneNumber('');
      setSelectedCountry(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  // Update selected country when country ID changes
  useEffect(() => {
    if (selectedCountryId && countries.length > 0) {
      const countryId = parseInt(selectedCountryId, 10);
      const foundCountry = countries.find((c) => c.id === countryId);
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        // Reset timezone when country changes
        const currentTimezone = getValues('preferredTimeZone');
        if (currentTimezone) {
          setValue('preferredTimeZone', '', { shouldValidate: false });
        }
      }
    }
  }, [selectedCountryId, countries, setValue, getValues]);

  // Update phone number country code when country changes
  useEffect(() => {
    if (selectedCountry && phoneNumber) {
      try {
        // Try to preserve the national number part and update country code
        const phoneNumberObj = parsePhoneNumber(phoneNumber);
        if (phoneNumberObj) {
          const nationalNumber = phoneNumberObj.nationalNumber;
          // Get country calling code for selected country
          const countryCode = getCountryCallingCode(
            selectedCountry.iso2.toUpperCase() as any,
          );
          if (countryCode && nationalNumber) {
            const currentCountryCode = phoneNumberObj.countryCallingCode;
            // Only update if country code is different
            if (currentCountryCode !== countryCode) {
              // Update phone number with new country code
              const updatedPhoneNumber = `+${countryCode}${nationalNumber}`;
              setPhoneNumber(updatedPhoneNumber);
              setValue('phoneNumber', updatedPhoneNumber);
            }
          }
        }
      } catch (error) {
        // If parsing fails, continue with current value
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry?.id]);

  // Fetch organizations and roles when dialog opens
  useEffect(() => {
    if (open) {
      // Fetch organizations
      if (organizations.length === 0) {
        dispatch(getAllOrganizations({ page: 1, page_size: 100 }));
      }
      // Fetch roles
      if (roles.length === 0) {
        dispatch(getAllRole({ page: 1, page_size: 100 }));
      }
    }
  }, [open, dispatch, organizations.length, roles.length]);

  const onSubmit = async (data: InviteUserFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Preferred Timezone value:', data.preferredTimeZone);
    console.log('Form state at submit:', watch());
    try {
      // Convert organization IDs to numbers
      const organizationIds = data.organizations.map((id) => parseInt(id, 10));
      const roleId = parseInt(data.role, 10);
      const countryId = parseInt(data.country, 10);

      if (
        organizationIds.some((id) => isNaN(id)) ||
        isNaN(roleId) ||
        isNaN(countryId)
      ) {
        setToast({
          message: 'Please select valid organizations, role, and country',
          type: 'error',
        });
        return;
      }

      // Get country name or ISO code from selected country
      const selectedCountryObj = countries.find((c) => c.id === countryId);
      const countryName =
        selectedCountryObj?.name || selectedCountryObj?.iso2 || data.country;

      // Parse phone number to get country code and national number
      let mobileCountryCode = '+1';
      let mobileNumber = '';
      if (phoneNumber) {
        try {
          const phoneNumberObj = parsePhoneNumber(phoneNumber);
          if (phoneNumberObj) {
            mobileCountryCode = `+${phoneNumberObj.countryCallingCode}`;
            mobileNumber = phoneNumberObj.nationalNumber;
          }
        } catch (error) {
          // If parsing fails, use the phone number as is
          mobileNumber = phoneNumber;
        }
      }

      await dispatch(
        inviteUser({
          payload: {
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            role_id: roleId,
            organization_ids: organizationIds,
            country: countryName,
            mobile_number: mobileNumber,
            mobile_country_code: mobileCountryCode,
            preferred_timezone: data.preferredTimeZone,
          },
          api: httpClient,
        }),
      ).unwrap();

      // Show success toast with user email
      setToast({
        message: `Invitation sent successfully to ${data.email}!`,
        type: 'success',
      });

      // Reset form and close dialog after a delay
      reset();
      setTimeout(() => {
        onOpenChange(false);
        setToast(null);
        dispatch(resetInviteUserState());
      }, 2000);
    } catch (err) {
      console.error('Invite user failed', err);
      // Error toast is already handled by the useEffect hook
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Invite User
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Row - 3 columns: First Name, Last Name, Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  className={`h-10 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600 ${
                    errors.firstName ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  className={`h-10 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600 ${
                    errors.lastName ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className={`h-10 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Second Row - 3 columns: Country, Role, Preferred Timezone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Country <span className="text-red-500">*</span>
                </Label>
                <Combobox
                  options={countries.map((country) => ({
                    value: country.id.toString(),
                    label: country.name,
                  }))}
                  value={selectedCountryId}
                  onValueChange={(value) => {
                    setValue('country', value);
                    const countryId = parseInt(value, 10);
                    const foundCountry = countries.find(
                      (c) => c.id === countryId,
                    );
                    if (foundCountry) {
                      setSelectedCountry(foundCountry);
                      // Update phone input default country based on selected country
                      if (foundCountry.iso2) {
                        // PhoneInput will automatically update based on country
                      }
                    }
                  }}
                  placeholder={
                    loadingCountries ? 'Loading...' : 'Select Country'
                  }
                  searchPlaceholder="Search countries..."
                  emptyMessage="No countries found"
                  loading={loadingCountries}
                  className="w-full"
                  disabled={loadingCountries}
                />
                {errors.country && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Role <span className="text-red-500">*</span>
                </Label>
                <Combobox
                  options={roleOptions}
                  value={selectedRole}
                  onValueChange={(value) => setValue('role', value)}
                  placeholder={rolesLoading ? 'Loading...' : 'Select Role'}
                  searchPlaceholder="Search roles..."
                  emptyMessage="No roles found"
                  loading={rolesLoading}
                  className="w-full"
                  disabled={rolesLoading}
                />
                {errors.role && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Preferred Timezone */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="preferredTimeZone"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Preferred Timezone <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="preferredTimeZone"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange, ...fieldProps } }) => {
                    console.log('Controller render - value:', value);
                    return (
                      <Select
                        {...fieldProps}
                        value={value || undefined}
                        onValueChange={(selectedValue) => {
                          console.log(
                            'Timezone selected - selectedValue:',
                            selectedValue,
                          );
                          console.log(
                            'Before onChange - current value:',
                            value,
                          );
                          // Call onChange to update form state
                          onChange(selectedValue);
                          // Log after a brief delay to check if state updated
                          setTimeout(() => {
                            const currentValue = getValues('preferredTimeZone');
                            const allValues = getValues();
                            console.log(
                              'Form state after onChange - preferredTimeZone:',
                              currentValue,
                            );
                            console.log('All form values:', allValues);
                          }, 100);
                        }}
                        disabled={
                          !selectedCountry || timezoneOptions.length === 0
                        }
                      >
                        <SelectTrigger
                          id="preferredTimeZone"
                          className={`w-full h-10 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600 ${
                            errors.preferredTimeZone
                              ? 'border-red-500 focus:ring-red-500'
                              : ''
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              !selectedCountry
                                ? 'Select Country first'
                                : timezoneOptions.length === 0
                                  ? 'Loading timezones...'
                                  : 'Select Timezone'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent
                          className="dark:bg-slate-700 dark:border-gray-600 max-h-[300px]"
                          position="popper"
                          sideOffset={4}
                        >
                          {timezoneOptions.length === 0 ? (
                            <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                              {!selectedCountry
                                ? 'Select Country first'
                                : 'Loading timezones...'}
                            </div>
                          ) : (
                            timezoneOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="dark:text-gray-100 dark:focus:bg-slate-600 cursor-pointer"
                              >
                                {option.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.preferredTimeZone && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.preferredTimeZone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Third Row - 1 column: Mobile Number */}
            <div className="grid grid-cols-1 gap-4">
              {/* Mobile Number */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mobile Number
                </Label>
                <PhoneInput
                  international
                  defaultCountry={
                    selectedCountry?.iso2
                      ? (selectedCountry.iso2.toUpperCase() as any)
                      : 'US'
                  }
                  value={phoneNumber}
                  onChange={(value) => {
                    setPhoneNumber(value || '');
                    setValue('phoneNumber', value || '');
                  }}
                  className="phone-input-container"
                  disabled={!selectedCountry}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fourth Row - 1 column: Organizations (Textarea Style) */}
            <div className="grid grid-cols-1 gap-4">
              {/* Organization Multi-Select - Textarea Style */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="organizations"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Organizations <span className="text-red-500">*</span>
                </Label>
                <MultiSelectCombobox
                  options={organizations
                    .filter((org) => org.id != null)
                    .map((org) => ({
                      value: org.id?.toString() || '',
                      label: org.name || '',
                    }))}
                  selectedValues={selectedOrganizations}
                  onSelectionChange={(values) =>
                    setValue('organizations', values)
                  }
                  placeholder="Select Organizations"
                  searchPlaceholder="Search organizations..."
                  emptyMessage="No organizations found"
                  loading={organizationsLoading}
                  error={!!errors.organizations}
                />
                {errors.organizations && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.organizations.message}
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {/* Success Toast */}
            {toast?.type === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-md p-3 text-sm">
                {toast.message}
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#4F39F6] hover:bg-[#3D2DC4] text-white dark:bg-[#4F39F6] dark:hover:bg-[#3D2DC4] h-10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Sending...</span>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Multi-Select Combobox Component
interface MultiSelectComboboxProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  error?: boolean;
}

function MultiSelectCombobox({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  disabled = false,
  className,
  loading = false,
  error = false,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const selectAll = () => {
    const filteredValues = filteredOptions.map((opt) => opt.value);
    const allFilteredAreSelected = filteredValues.every((val) =>
      selectedValues.includes(val),
    );

    if (allFilteredAreSelected) {
      // Deselect all filtered options
      onSelectionChange(
        selectedValues.filter((v) => !filteredValues.includes(v)),
      );
    } else {
      // Select all filtered options
      const newSelection = [
        ...selectedValues.filter((v) => !filteredValues.includes(v)),
        ...filteredValues,
      ];
      onSelectionChange(newSelection);
    }
  };

  const allFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedValues.includes(opt.value));

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedValues.filter((v) => v !== value));
  };

  const displayText =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
        ? selectedOptions[0].label
        : `${selectedOptions.length} selected`;

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          'w-full justify-start items-start dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600 min-h-[80px] py-2',
          selectedOptions.length > 0 && 'overflow-hidden',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
        )}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
      >
        <div className="flex items-start gap-1 flex-1 overflow-y-auto overflow-x-hidden min-h-[60px] max-h-[100px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap items-start gap-1.5 w-full">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#4F39F6]/10 text-[#4F39F6] dark:bg-[#4F39F6]/20 dark:text-[#4F39F6] rounded text-xs font-medium whitespace-nowrap shrink-0"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(option.value, e)}
                    className="hover:bg-[#4F39F6]/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{displayText}</span>
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 mt-1" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 dark:bg-slate-800 dark:text-gray-100"
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {loading ? (
                <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </div>
              ) : (
                <div className="py-1">
                  {/* Select All Option */}
                  {filteredOptions.length > 1 && (
                    <label
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer border-b border-gray-200 dark:border-gray-600 font-medium sticky top-0 bg-white dark:bg-slate-700 z-10',
                        allFilteredSelected
                          ? 'bg-[#4F39F6]/10 text-[#4F39F6] dark:bg-[#4F39F6]/20 dark:text-[#4F39F6]'
                          : 'text-gray-900 dark:text-gray-100',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={selectAll}
                        className="sr-only"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {allFilteredSelected ? (
                        <CheckSquare2 className="h-4 w-4 shrink-0 text-[#4F39F6] dark:text-[#4F39F6]" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                      )}
                      <span className="truncate flex-1">
                        Select All ({filteredOptions.length})
                      </span>
                    </label>
                  )}
                  {/* Individual Options */}
                  <div>
                    {filteredOptions.map((option) => {
                      const isSelected = selectedValues.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-[#4F39F6]/10 text-[#4F39F6] dark:bg-[#4F39F6]/20 dark:text-[#4F39F6]'
                              : 'text-gray-900 dark:text-gray-100',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOption(option.value)}
                            className="sr-only"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {isSelected ? (
                            <CheckSquare2 className="h-4 w-4 shrink-0 text-[#4F39F6] dark:text-[#4F39F6]" />
                          ) : (
                            <Square className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                          )}
                          <span className="truncate flex-1">
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InviteUserForm;
