import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector } from '@/store';
import { Eye, Search, Plus } from 'lucide-react';
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

// Static mock data
const staticUsers: UserRow[] = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@talentedge.com',
    role: { id: 1, name: 'admin' },
    role_id: 1,
    role_name: 'admin',
    is_active: true,
    created_at: '2025-01-15T10:30:00',
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@talentedge.com',
    role: { id: 2, name: 'TA_Executive' },
    role_id: 2,
    role_name: 'TA_Executive',
    is_active: true,
    created_at: '2025-01-16T11:00:00',
  },
  {
    id: 3,
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike.johnson@talentedge.com',
    role: { id: 3, name: 'TA_Manager' },
    role_id: 3,
    role_name: 'TA_Manager',
    is_active: true,
    created_at: '2025-01-17T09:15:00',
  },
  {
    id: 4,
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.williams@talentedge.com',
    role: { id: 4, name: 'Hiring_Manager' },
    role_id: 4,
    role_name: 'Hiring_Manager',
    is_active: true,
    created_at: '2025-01-18T14:20:00',
  },
  {
    id: 5,
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@talentedge.com',
    role: { id: 5, name: 'Interview_Panel' },
    role_id: 5,
    role_name: 'Interview_Panel',
    is_active: true,
    created_at: '2025-01-19T08:45:00',
  },
  {
    id: 6,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@talentedge.com',
    role: { id: 6, name: 'HR_Ops' },
    role_id: 6,
    role_name: 'HR_Ops',
    is_active: false,
    created_at: '2025-01-20T16:30:00',
  },
];

const UsersPage: React.FC = () => {
  const role = useUserRole();
  const { user } = useAppSelector((state) => state.auth);
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

  const tabs = ['All', 'Active', 'Inactive', 'Recent'];

  // Filter users based on role
  const allUsers =
    roleId === 2
      ? staticUsers.filter((u) => (u.role?.id ?? u.role_id) !== 1)
      : staticUsers;

  // Filter users based on selected tab
  const filteredByTab = () => {
    switch (selectedTab) {
      case 'Active':
        return allUsers.filter((u) => u.is_active === true);
      case 'Inactive':
        return allUsers.filter((u) => u.is_active === false);
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

  // Filter by search term
  const users = filteredByTab().filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.first_name || ''} ${u.last_name || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (u.role?.name || u.role_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const handleViewDetails = (user: UserRow) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : users.map((item) => item.id));
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
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
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
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
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
                {users.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center"
                      colSpan={6}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(u.id)}
                          onChange={() => handleSelectItem(u.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {u.first_name || u.last_name
                            ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                            : u.name || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {u.role?.name || u.role_name || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={u.is_active || false}
                            disabled
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(u)}
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
            Showing 1 to {users.length} of {users.length} users.
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled className="text-gray-400">
              Previous
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              1
            </Button>
            <Button variant="outline" disabled className="text-gray-400">
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
                      {selectedUser.role?.name || selectedUser.role_name || '—'}
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
