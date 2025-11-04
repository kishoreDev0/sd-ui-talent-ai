import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
interface InviteUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inviteUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
});

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organization: '',
      role: '',
    },
  });

  const selectedRole = watch('role');
  const selectedOrganization = watch('organization');

  useEffect(() => {
    if (isSuccess) {
      setToast({
        message: 'User invitation sent successfully!',
        type: 'success',
      });
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    try {
      // Combine firstName and lastName into name for API compatibility
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      await dispatch(
        inviteUser({
          name: fullName,
          email: data.email,
          organization: data.organization,
          role: data.role,
          api: httpClient,
        }),
      ).unwrap();
    } catch (err) {
      console.error('Invite user failed', err);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Invite User
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name and Last Name - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Organization and Role - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organization */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="organization"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Organization <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedOrganization}
                  onValueChange={(value) => setValue('organization', value)}
                >
                  <SelectTrigger
                    id="organization"
                    className={`h-10 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600 ${
                      errors.organization
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                  >
                    <SelectValue placeholder="Select Organization" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-700 dark:border-gray-600">
                    {organizationsLoading ? (
                      <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading organizations...
                      </div>
                    ) : organizations.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No organizations found
                      </div>
                    ) : (
                      organizations.map((org) => (
                        <SelectItem
                          key={org.id}
                          value={org.id.toString()}
                          className="dark:text-gray-100 dark:focus:bg-slate-600"
                        >
                          {org.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.organization && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.organization.message}
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
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setValue('role', value)}
                >
                  <SelectTrigger
                    id="role"
                    className={`h-10 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600 ${
                      errors.role ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-700 dark:border-gray-600">
                    {rolesLoading ? (
                      <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading roles...
                      </div>
                    ) : roles.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No roles found
                      </div>
                    ) : (
                      roles
                        .filter((role) => role.active !== false)
                        .map((role) => (
                          <SelectItem
                            key={role.id}
                            value={role.id.toString()}
                            className="dark:text-gray-100 dark:focus:bg-slate-600"
                          >
                            {role.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {errors.role.message}
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

export default InviteUserForm;
