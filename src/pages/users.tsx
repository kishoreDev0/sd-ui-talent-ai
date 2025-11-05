import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector, useAppDispatch } from '@/store';
import { getAllUsers } from '@/store/user/actions/userActions';
import { Eye, Search, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
}

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const role = useUserRole();
  const { user } = useAppSelector((state) => state.auth);
  const { users, loading, error, total, page, pageSize, totalPages } =
    useAppSelector((state) => state.user);

  const roleId =
    user?.role?.id ??
    user?.role_id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role?.id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role_id;

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
  const currentUserId = user?.id ?? JSON.parse(localStorage.getItem('user') || 'null')?.id;
  const currentUserEmail = user?.email ?? JSON.parse(localStorage.getItem('user') || 'null')?.email;

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
      <div className="space-y-4">
        {/* Header */}
        <div className="px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Manage team members and their settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-gray-600 rounded"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select All
              </label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 dark:bg-slate-800 dark:text-gray-100"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
          <Button className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    USER
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ROLE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ACTIVE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center"
                      colSpan={6}
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-4 py-3 text-red-500 dark:text-red-400 text-center"
                      colSpan={6}
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center"
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(u.id)}
                          onChange={() => handleSelectItem(u.id)}
                          className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-gray-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {u.first_name || u.last_name
                            ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                            : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {u.role?.name || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={u.is_active || false}
                            disabled
                            className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-gray-600 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
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
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{' '}
            {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, total)} of {total} users.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="text-gray-400"
            >
              Previous
            </Button>
            <Button className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white">
              {currentPage}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages || loading}
              className="text-gray-400"
            >
              Next
            </Button>
          </div>
        </div>

        {/* User Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      User ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.first_name || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.last_name || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.first_name || selectedUser.last_name
                        ? `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim()
                        : selectedUser.name || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.role?.name || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.role?.id ?? selectedUser.role_id ?? '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
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
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
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
