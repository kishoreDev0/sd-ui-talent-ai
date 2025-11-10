import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector, useAppDispatch } from '@/store';
import { getAllUsers, updateUser } from '@/store/user/actions/userActions';
import { getAllRole } from '@/store/role/actions/roleActions';
import { useToast } from '@/components/ui/toast';
import { Eye, Search, Plus, RefreshCw, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface UserRow {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: { id?: number; name?: string };
  role_id?: number;
  role_name?: string;
  is_active?: boolean;
  created_at?: string;
  name?: string;
  mobile_country_code?: string;
  mobile_number?: string;
  preferred_timezone?: string;
  country?: string;
}

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const role = useUserRole();
  const { user } = useAppSelector((state) => state.auth);
  const { users, loading, error, total, page, pageSize, totalPages } =
    useAppSelector((state) => state.user);
  const { roles, loading: rolesLoading } = useAppSelector(
    (state) => state.role,
  );
  const { showToast } = useToast();

  const roleId =
    user?.role?.id ??
    user?.role_id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role?.id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role_id;

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    roleId: '',
    isActive: false,
    mobileCountryCode: '',
    mobileNumber: '',
    preferredTimezone: '',
    country: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const tabs = ['All', 'Active', 'Inactive', 'Recent'];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (roleId === 1 && roles.length === 0) {
      dispatch(getAllRole({ page: 1, page_size: 100 }));
    }
  }, [dispatch, roleId, roles.length]);

  // Fetch users on component mount and when filters change
  useEffect(() => {
    const params: {
      page?: number;
      page_size?: number;
      search?: string;
      is_active?: boolean;
      role_id?: number;
    } = {
      page: currentPage,
      page_size: 10,
    };

    // Add search if provided
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Add filter based on selected tab
    if (selectedTab === 'Active') {
      params.is_active = true;
    } else if (selectedTab === 'Inactive') {
      params.is_active = false;
    }

    // Filter by role for TA_Executive
    if (roleId === 2) {
      params.role_id = 2; // Only show TA_Executive users, exclude admin
    }

    // Note: Admin role exclusion is handled client-side in allUsers filter

    dispatch(getAllUsers(params));
  }, [dispatch, currentPage, debouncedSearchTerm, selectedTab, roleId]);

  // Get current user ID/email to exclude from list
  const currentUserId =
    user?.id ?? JSON.parse(localStorage.getItem('user') || 'null')?.id;
  const currentUserEmail =
    user?.email ?? JSON.parse(localStorage.getItem('user') || 'null')?.email;

  // Filter users: exclude admin role users and current user
  const allUsers = users.filter((u) => {
    // Exclude admin role users (role_id === 1)
    const userRoleId = u.role?.id ?? u.role_id;
    if (userRoleId === 1) return false;

    // Exclude current user by ID or email
    if (currentUserId && u.id === currentUserId) return false;
    if (currentUserEmail && u.email === currentUserEmail) return false;

    return true;
  });

  // Filter users based on selected tab (client-side for Recent tab)
  const filteredByTab = () => {
    switch (selectedTab) {
      case 'Recent':
        return [...allUsers].sort(
          (a, b) =>
            new Date(b.created_at || '').getTime() -
            new Date(a.created_at || '').getTime(),
        );
      default:
        return allUsers;
    }
  };

  // Filter by search term (client-side as backup if API doesn't handle it)
  const filteredUsers = filteredByTab().filter(
    (u) =>
      !searchTerm ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.first_name || ''} ${u.last_name || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (u.role?.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRefresh = () => {
    const params: {
      page?: number;
      page_size?: number;
      search?: string;
      is_active?: boolean;
      role_id?: number;
    } = {
      page: currentPage,
      page_size: 10,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (selectedTab === 'Active') {
      params.is_active = true;
    } else if (selectedTab === 'Inactive') {
      params.is_active = false;
    }

    if (roleId === 2) {
      params.role_id = 2;
    }

    dispatch(getAllUsers(params));
  };

  const handleViewDetails = (user: UserRow) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    setIsEditMode(false);
    setIsSaving(false);
    setFormState({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      roleId: user.role?.id
        ? user.role.id.toString()
        : user.role_id?.toString() || '',
      isActive: user.is_active ?? false,
      mobileCountryCode: user.mobile_country_code || '',
      mobileNumber: user.mobile_number || '',
      preferredTimezone: user.preferred_timezone || '',
      country: user.country || '',
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : filteredUsers.map((item) => item.id));
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setSelectAll(false);
    setSelectedItems([]);
    setCurrentPage(1); // Reset to first page when tab changes
  };

  useEffect(() => {
    if (!isDetailsOpen) {
      setIsEditMode(false);
      setIsSaving(false);
    }
  }, [isDetailsOpen]);

  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        value: r.id?.toString() || '',
        label: r.name || '',
      })),
    [roles],
  );

  const handleFormChange = (
    key: keyof typeof formState,
    value: string | boolean,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {};

      if (formState.firstName !== undefined) {
        payload.first_name = formState.firstName;
      }
      if (formState.lastName !== undefined) {
        payload.last_name = formState.lastName;
      }
      if (formState.roleId) {
        payload.role_id = parseInt(formState.roleId, 10);
      }
      payload.is_active = formState.isActive;
      if (formState.mobileCountryCode) {
        payload.mobile_country_code = formState.mobileCountryCode;
      }
      if (formState.mobileNumber) {
        payload.mobile_number = formState.mobileNumber;
      }
      if (formState.preferredTimezone) {
        payload.preferred_timezone = formState.preferredTimezone;
      }
      if (formState.country) {
        payload.country = formState.country;
      }

      await dispatch(updateUser({ id: selectedUser.id, payload })).unwrap();

      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              first_name: formState.firstName,
              last_name: formState.lastName,
              role: {
                ...(prev.role || {}),
                id: formState.roleId
                  ? parseInt(formState.roleId, 10)
                  : prev.role?.id,
                name: formState.roleId
                  ? roleOptions.find((r) => r.value === formState.roleId)
                      ?.label || prev.role?.name
                  : prev.role?.name,
              },
              role_id: formState.roleId
                ? parseInt(formState.roleId, 10)
                : prev.role_id,
              is_active: formState.isActive,
              mobile_country_code: formState.mobileCountryCode,
              mobile_number: formState.mobileNumber,
              preferred_timezone: formState.preferredTimezone,
              country: formState.country,
            }
          : prev,
      );

      showToast('User details updated successfully', 'success');
      setIsEditMode(false);
    } catch (err: any) {
      const message =
        err?.message ||
        err?.payload?.message ||
        err?.error ||
        'Failed to update user';
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!(roleId === 1 || roleId === 2)) {
    return (
      <MainLayout role={role}>
        <div className="space-y-4">
          <div className="px-4 py-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Only admins and TA executives can view users.
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={role}>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Users
          </h1>
          <p className="mt-0.5 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
            Manage team members and their settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  selectedTab === tab
                    ? 'border-[#4F39F6] text-[#4F39F6] dark:text-[#4F39F6]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-3">
            <div className="flex items-center space-x-1.5">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-3.5 w-3.5 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-gray-600 rounded"
              />
              <label className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                Select All
              </label>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-3.5 w-3.5" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-9 text-xs sm:text-sm w-full sm:w-64 dark:bg-slate-800 dark:text-gray-100"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex h-8 items-center gap-1.5 px-3 text-xs sm:text-sm"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
          <Button className="h-8 w-full bg-[#4F39F6] px-3 text-xs text-white hover:bg-[#3D2DC4] sm:w-auto sm:text-sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add User
          </Button>
        </div>

        {/* Table */}
        <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-slate-800">
          <div className="-mx-2 overflow-x-auto sm:mx-0">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6] dark:border-gray-600"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    USER
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    EMAIL
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    ROLE
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    ACTIVE
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-slate-800">
                {loading ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-xs text-gray-500 dark:text-gray-400"
                      colSpan={6}
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-xs text-red-500 dark:text-red-400"
                      colSpan={6}
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-xs text-gray-500 dark:text-gray-400"
                      colSpan={6}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(u.id)}
                          onChange={() => handleSelectItem(u.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6] dark:border-gray-600"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-[13px] font-medium text-gray-900 dark:text-gray-100">
                          {u.first_name || u.last_name
                            ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                            : '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900 dark:text-gray-100">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900 dark:text-gray-100">
                          {u.role?.name || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              u.is_active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                            }`}
                          >
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(u as UserRow)}
                          className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-2 border-t border-gray-200 px-4 py-2 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div>
            Page {currentPage} • {filteredUsers.length} of {total} users
          </div>
          <div className="flex w-full items-center justify-center space-x-2 sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="h-8 px-3 text-xs text-gray-600 sm:text-sm"
            >
              Previous
            </Button>
            <Button className="h-8 px-3 bg-[#4F39F6] text-xs text-white hover:bg-[#3D2DC4] sm:text-sm">
              {currentPage}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages || loading}
              className="h-8 px-3 text-xs text-gray-600 sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>

        {/* User Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                User Details
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      User ID
                    </label>
                    <p className="mt-1 text-xs text-gray-900 dark:text-gray-100">
                      {selectedUser.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="mt-1 text-xs text-gray-900 dark:text-gray-100">
                      {selectedUser.email}
                    </p>
                  </div>
                  {roleId === 1 && (
                    <div className="flex items-center gap-2">
                      {isEditMode ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditMode(false);
                              setFormState({
                                firstName: selectedUser.first_name || '',
                                lastName: selectedUser.last_name || '',
                                roleId: selectedUser.role?.id
                                  ? selectedUser.role.id.toString()
                                  : selectedUser.role_id?.toString() || '',
                                isActive: selectedUser.is_active ?? false,
                                mobileCountryCode:
                                  selectedUser.mobile_country_code || '',
                                mobileNumber: selectedUser.mobile_number || '',
                                preferredTimezone:
                                  selectedUser.preferred_timezone || '',
                                country: selectedUser.country || '',
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditMode(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <Input
                      value={selectedUser.email}
                      disabled
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    {isEditMode ? (
                      <Select
                        value={formState.roleId}
                        onValueChange={(value) =>
                          handleFormChange('roleId', value)
                        }
                        disabled={rolesLoading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue
                            placeholder={
                              rolesLoading ? 'Loading roles...' : 'Select role'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((roleOption) => (
                            <SelectItem
                              key={roleOption.value}
                              value={roleOption.value}
                            >
                              {roleOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedUser.role?.name || '—'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    {isEditMode ? (
                      <Input
                        value={formState.firstName}
                        onChange={(e) =>
                          handleFormChange('firstName', e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedUser.first_name || '—'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    {isEditMode ? (
                      <Input
                        value={formState.lastName}
                        onChange={(e) =>
                          handleFormChange('lastName', e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedUser.last_name || '—'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Status
                    </label>
                    {isEditMode ? (
                      <div className="mt-1 flex items-center gap-3">
                        <Switch
                          checked={formState.isActive}
                          onCheckedChange={(checked) =>
                            handleFormChange('isActive', checked)
                          }
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {formState.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedUser.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {selectedUser.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mobile Country Code
                    </label>
                    {isEditMode ? (
                      <Input
                        value={formState.mobileCountryCode}
                        onChange={(e) =>
                          handleFormChange('mobileCountryCode', e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedUser.mobile_country_code || '—'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mobile Number
                    </label>
                    {isEditMode ? (
                      <Input
                        value={formState.mobileNumber}
                        onChange={(e) =>
                          handleFormChange('mobileNumber', e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedUser.mobile_number || '—'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preferred Timezone
                    </label>
                    {isEditMode ? (
                      <Input
                        value={formState.preferredTimezone}
                        onChange={(e) =>
                          handleFormChange('preferredTimezone', e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedUser.preferred_timezone || '—'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    {isEditMode ? (
                      <Input
                        value={formState.country}
                        onChange={(e) =>
                          handleFormChange('country', e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedUser.country || '—'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created At
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedUser.created_at
                        ? new Date(selectedUser.created_at).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default UsersPage;
