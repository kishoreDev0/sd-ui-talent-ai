import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store';
import { getAllRole } from '@/store/role/actions/roleActions';

const AdminAccessPage: React.FC = () => {
  const role = useUserRole();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  // For Roles CRUD UI
  const [roleTab, setRoleTab] = useState('All');
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const roleTabs = ['All', 'Active', 'Inactive', 'Recent'];

  // Redux dynamic roles
  const dispatch = useAppDispatch();
  const { roles, loading } = useAppSelector((state) => state.role);

  useEffect(() => {
    dispatch(getAllRole());
  }, [dispatch]);

  // Filtering and search (dynamic data)
  let displayRoles = Array.isArray(roles) ? [...roles] : [];
  if (roleTab === 'Active') displayRoles = displayRoles.filter((r) => r.active);
  if (roleTab === 'Inactive')
    displayRoles = displayRoles.filter((r) => !r.active);
  if (searchTerm)
    displayRoles = displayRoles.filter((r) =>
      (r.name + (r.description || ''))
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

  // Fallback mock roles (2 entries) if API returns empty
  const mockRoles = [
    { id: 2, name: 'TA_Executive', description: 'Recruitment operations', active: true },
    { id: 5, name: 'Interview_Panel', description: 'Conduct interviews', active: true },
  ];
  const rolesToRender = displayRoles.length > 0 ? displayRoles : mockRoles;

  // Selection logic
  const handleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    setSelectedRoles(next ? displayRoles.map((r) => r.id) : []);
  };
  const handleSelectRole = (id: number) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id],
    );
  };

  const handleRoleTabChange = (tab: string) => {
    setRoleTab(tab);
    setSelectedRoles([]);
    setSelectAll(false);
  };

  // Row actions: Edit & Manage Permissions
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<{ id: number; name: string; description?: string; active?: boolean } | null>(null);

  type Access = { read: boolean; write: boolean; update: boolean; edit: boolean; delete: boolean };
  type PermissionMatrix = Record<string, Access>;
  const defaultMatrix: PermissionMatrix = {
    Jobs: { read: false, write: false, update: false, edit: false, delete: false },
    Candidates: { read: false, write: false, update: false, edit: false, delete: false },
    Interviews: { read: false, write: false, update: false, edit: false, delete: false },
    Analytics: { read: false, write: false, update: false, edit: false, delete: false },
    Users: { read: false, write: false, update: false, edit: false, delete: false },
    Settings: { read: false, write: false, update: false, edit: false, delete: false },
  };
  const [permMatrix, setPermMatrix] = useState<PermissionMatrix>(defaultMatrix);

  const openEdit = (r: { id: number; name: string; description?: string; active?: boolean }) => {
    setCurrentRole(r);
    setIsEditOpen(true);
  };

  const openManagePermissions = (r: { id: number; name: string }) => {
    setCurrentRole(r);
    const seeded: PermissionMatrix = JSON.parse(JSON.stringify(defaultMatrix));
    if (r.name === 'TA_Executive') {
      seeded.Jobs = { read: true, write: true, update: true, edit: true, delete: true };
    }
    if (r.name === 'Interview_Panel') {
      seeded.Jobs = { read: true, write: false, update: false, edit: false, delete: false };
    }
    setPermMatrix(seeded);
    setIsPermOpen(true);
  };

  const togglePerm = (module: string, key: keyof Access) => {
    setPermMatrix((prev) => ({
      ...prev,
      [module]: { ...prev[module], [key]: !prev[module][key] },
    }));
  };

  return (
    <MainLayout role={role}>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Control
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage roles and permissions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'roles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </Button>
          <Button
            variant={activeTab === 'permissions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'roles' ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-white/10 px-0">
              <nav className="-mb-px flex space-x-6">
                {roleTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleRoleTabChange(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      roleTab === tab
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            {/* Search and Add Button */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select All
                  </label>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-72"
                  />
                </div>
              </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Role
              </Button>
            </div>
            {/* Roles Table */}
            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-white/10">
                    {rolesToRender.map((role) => (
                      <tr
                        key={role.id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-900"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role.id)}
                            onChange={() => handleSelectRole(role.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {role.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                            {role.description}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {(role as any).created_by || ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={!!role.active}
                              readOnly
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-900 dark:text-gray-200">
                              {role.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {(role as any).createdAt || ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {(role as any).updatedAt || ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(role)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openManagePermissions(role)}>
                                Manage Permissions
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-white/10">
              <div className="text-sm text-gray-700 dark:text-gray-200">
                Showing 1 to {rolesToRender.length} of {rolesToRender.length} roles.
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" disabled className="text-gray-400">
                  Previous
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  1
                </Button>
                <Button variant="outline" disabled className="text-gray-400">
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Permissions
              </h2>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Add Permission
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300">
                    <th className="py-2 pr-4">Permission</th>
                    <th className="py-2 pr-4">Key</th>
                    <th className="py-2 pr-4">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-gray-100">
                  {[
                    {
                      name: 'View Dashboard',
                      key: 'view_dashboard',
                      desc: 'Access to dashboard',
                    },
                    {
                      name: 'Manage Jobs',
                      key: 'manage_jobs',
                      desc: 'Create and manage jobs',
                    },
                    {
                      name: 'View Candidates',
                      key: 'view_candidates',
                      desc: 'View candidate profiles',
                    },
                    {
                      name: 'Schedule Interviews',
                      key: 'schedule_interviews',
                      desc: 'Create interview schedules',
                    },
                  ].map((p) => (
                    <tr
                      key={p.key}
                      className="border-t border-gray-200 dark:border-white/10"
                    >
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4">{p.key}</td>
                      <td className="py-3 pr-4">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Role Name</label>
              <Input
                value={currentRole?.name || ''}
                onChange={(e) => setCurrentRole((prev) => ({ ...(prev as any), name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Description</label>
              <Input
                value={currentRole?.description || ''}
                onChange={(e) => setCurrentRole((prev) => ({ ...(prev as any), description: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!currentRole?.active}
                onChange={(e) => setCurrentRole((prev) => ({ ...(prev as any), active: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsEditOpen(false)}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={isPermOpen} onOpenChange={setIsPermOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions — {currentRole?.name || ''}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Module</th>
                  <th className="py-2 pr-4">Read</th>
                  <th className="py-2 pr-4">Write</th>
                  <th className="py-2 pr-4">Update</th>
                  <th className="py-2 pr-4">Edit</th>
                  <th className="py-2 pr-4">Delete</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 dark:text-gray-100">
                {Object.keys(permMatrix).map((mod) => (
                  <tr key={mod} className="border-t">
                    <td className="py-2 pr-4 font-medium">{mod}</td>
                    {(['read','write','update','edit','delete'] as Array<'read'|'write'|'update'|'edit'|'delete'>).map((k) => (
                      <td key={k} className="py-2 pr-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={permMatrix[mod][k]}
                          onChange={() => togglePerm(mod, k)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setIsPermOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsPermOpen(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminAccessPage;
