import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store';
import { getAllRole, createRole, updateRole } from '@/store/role/actions/roleActions';
import { syncPermissions } from '@/store/permission/actions/permissionActions';
import { setPermissionPage } from '@/store/permission/slices/permissionSlice';

const AdminAccessPage: React.FC = () => {
  const role = useUserRole();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  // For Roles CRUD UI
  // Removed secondary tabs
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  // const roleTabs = ['All', 'Active', 'Inactive', 'Recent'];

  // Redux dynamic roles
  const dispatch = useAppDispatch();
  const { roles, loading, total } = useAppSelector((state) => state.role);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeOnly] = useState(false);

  useEffect(() => {
    dispatch(getAllRole({ page, page_size: pageSize, active_only: activeOnly }));
  }, [dispatch, page, pageSize, activeOnly]);

  // Filtering and search (dynamic data)
  let displayRoles = Array.isArray(roles) ? [...roles] : [];
  // Removed roleTab filtering
  if (searchTerm)
    displayRoles = displayRoles.filter((r) =>
      (r.name + (r.description || ''))
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

  // Use only API-provided roles
  const rolesToRender = displayRoles;

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

  // Secondary tab change removed

  // Row actions: Edit & Manage Permissions
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<{ id: number; name: string; description?: string; active?: boolean } | null>(null);

  // Dynamic permission matrix based on API response
  type PermissionMatrix = Record<string, Record<string, { permission_id: number; role_permission_id: number | null; has_permission: boolean }>>;
  const [permMatrix, setPermMatrix] = useState<PermissionMatrix>({});
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);

  // Permissions from Redux
  const { permissions, loading: scanning, total: permTotal, page: permPage, pageSize: permPageSize, totalPages: permTotalPages } = useAppSelector((state) => state.permission);

  // Client-side pagination for permissions
  const startIndex = (permPage - 1) * permPageSize;
  const endIndex = startIndex + permPageSize;
  const paginatedPermissions = permissions.slice(startIndex, endIndex);

  const openEdit = (r: { id: number; name: string; description?: string; active?: boolean }) => {
    setActionMenuOpenId(null);
    setIsPermOpen(false);
    setCurrentRole(r);
    setIsEditOpen(true);
  };

  const openManagePermissions = (r: { id: number; name: string }) => {
    setActionMenuOpenId(null);
    setIsEditOpen(false);
    setCurrentRole(r);
    
    // Find the role with permissions from Redux state
    const roleWithPerms = roles.find((role) => role.id === r.id);
    const seeded: PermissionMatrix = {};
    
    // Populate matrix from API response
    if (roleWithPerms?.resources && Array.isArray(roleWithPerms.resources)) {
      roleWithPerms.resources.forEach((resourceData) => {
        const resourceName = resourceData.resource;
        seeded[resourceName] = {};
        
        // Populate actions for this resource
        if (resourceData.actions) {
          Object.keys(resourceData.actions).forEach((actionName) => {
            seeded[resourceName][actionName] = {
              permission_id: resourceData.actions[actionName].permission_id,
              role_permission_id: resourceData.actions[actionName].role_permission_id,
              has_permission: resourceData.actions[actionName].has_permission,
            };
          });
        }
      });
    }
    
    setPermMatrix(seeded);
    setIsPermOpen(true);
  };

  const togglePerm = (resource: string, action: string) => {
    setPermMatrix((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: {
          ...prev[resource][action],
          has_permission: !prev[resource][action].has_permission,
        },
      },
    }));
  };

  const handleScanPermissions = () => {
    dispatch(syncPermissions());
  };

  return (
    <MainLayout role={role}>
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Access Control
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Manage roles and permissions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'roles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('roles')}
            className="h-8 px-4 text-sm"
          >
            Roles
          </Button>
          <Button
            variant={activeTab === 'permissions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('permissions')}
            className="h-8 px-4 text-sm"
          >
            Permissions
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'roles' ? (
          <div className="space-y-3">
            {/* Secondary tabs removed */}
            {/* Search and Add Button */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    Select All
                  </label>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                  <Input
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64 h-8 text-sm"
                  />
                </div>
              </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-sm"
                disabled={loading}
                onClick={() => {
                  setIsCreating(true);
                  setCurrentRole({ id: 0, name: '', active: true });
                  setIsEditOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Role
              </Button>
            </div>
            {/* Roles Table */}
            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role.id)}
                            onChange={() => handleSelectRole(role.id)}
                            className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-[13px] font-medium text-gray-900 dark:text-gray-100">
                            {role.name}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={!!role.active}
                              readOnly
                              className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-xs text-gray-900 dark:text-gray-200">
                              {role.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900 dark:text-gray-100">
                            {(role as any).created_at || ''}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900 dark:text-gray-100">
                            {(role as any).updated_at || ''}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <DropdownMenu
                            open={actionMenuOpenId === role.id}
                            onOpenChange={(o) => setActionMenuOpenId(o ? role.id : null)}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
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
            <div className="flex items-center justify-between py-1 border-t border-gray-200 dark:border-white/10">
              <div className="text-sm text-gray-700 dark:text-gray-200">
                Page {page} • {rolesToRender.length} of {total || rolesToRender.length} roles
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  className="text-gray-700 h-8 px-3"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={rolesToRender.length < pageSize}
                  className="text-gray-700 h-8 px-3"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Permissions
              </h2>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-sm"
                disabled={scanning}
                onClick={handleScanPermissions}
              >
                <Search className="h-3.5 w-3.5 mr-1.5" /> {scanning ? 'Scanning...' : 'Scan Permissions'}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
                    <th className="py-2 pr-4 text-xs font-medium">Module</th>
                    <th className="py-2 pr-4 text-xs font-medium">Action</th>
                    <th className="py-2 pr-4 text-xs font-medium">Key</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-gray-100">
                  {permissions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-500 text-sm">
                        No permissions loaded. Click &quot;Scan Permissions&quot; to fetch from API.
                      </td>
                    </tr>
                  ) : (
                    paginatedPermissions.map((perm) => (
                      <tr key={perm.key} className="border-b border-gray-200 dark:border-white/10">
                        <td className="py-2 pr-4 text-xs font-medium capitalize">{perm.module}</td>
                        <td className="py-2 pr-4 text-xs capitalize">{perm.action}</td>
                        <td className="py-2 pr-4 text-xs font-mono text-gray-600 dark:text-gray-400">{perm.key}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {permissions.length > 0 && (
              <div className="flex items-center justify-between py-1 border-t border-gray-200 dark:border-white/10 mt-4">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  Page {permPage} • {paginatedPermissions.length} of {permTotal} permissions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={permPage <= 1}
                    className="text-gray-700 h-8 px-3"
                    onClick={() => dispatch(setPermissionPage(Math.max(1, permPage - 1)))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={permPage >= permTotalPages}
                    className="text-gray-700 h-8 px-3"
                    onClick={() => dispatch(setPermissionPage(permPage + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Edit Role Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setCurrentRole(null);
          if (!open) setIsCreating(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create Role' : 'Edit Role'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Role Name</label>
              <Input
                value={currentRole?.name || ''}
                onChange={(e) => setCurrentRole((prev) => ({ ...(prev as any), name: e.target.value }))}
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
              <Button
                disabled={isSaving || !currentRole?.name}
                onClick={async () => {
                  if (!currentRole?.name || !currentRole?.id) return;
                  try {
                    setIsSaving(true);
                    if (isCreating) {
                      await dispatch(
                        createRole({
                          payload: {
                            name: currentRole.name,
                            active: currentRole?.active ?? true,
                          },
                        }),
                      ).unwrap();
                    } else {
                      await dispatch(
                        updateRole({
                          id: currentRole.id,
                          payload: {
                            name: currentRole.name,
                            active: currentRole?.active ?? true,
                          },
                        }),
                      ).unwrap();
                    }
                    await dispatch(getAllRole({ page, page_size: pageSize, active_only: activeOnly }));
                    setIsEditOpen(false);
                    setCurrentRole(null);
                    setIsCreating(false);
                  } catch (error) {
                    console.error('Error saving role:', error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={isPermOpen}
        onOpenChange={(open) => {
          setIsPermOpen(open);
          if (!open) setCurrentRole(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions — {currentRole?.name || ''}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            {Object.keys(permMatrix).length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No permissions available for this role</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
                    <th className="py-2 pr-4">Resource</th>
                    {(() => {
                      // Get all unique actions across all resources
                      const allActions = new Set<string>();
                      Object.values(permMatrix).forEach((resource) => {
                        Object.keys(resource).forEach((action) => allActions.add(action));
                      });
                      return Array.from(allActions).sort();
                    })().map((action) => (
                      <th key={action} className="py-2 pr-4 capitalize">{action}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-gray-100">
                  {Object.keys(permMatrix).map((resource) => {
                    const resourceActions = permMatrix[resource];
                    const allActions = (() => {
                      const actions = new Set<string>();
                      Object.values(permMatrix).forEach((r) => {
                        Object.keys(r).forEach((a) => actions.add(a));
                      });
                      return Array.from(actions).sort();
                    })();
                    
                    return (
                      <tr key={resource} className="border-t">
                        <td className="py-2 pr-4 font-medium capitalize">
                          {resource.replace(/_/g, ' ')}
                        </td>
                        {allActions.map((action) => {
                          const permission = resourceActions[action];
                          if (!permission) {
                            return (
                              <td key={action} className="py-2 pr-4">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  disabled
                                  checked={false}
                                />
                              </td>
                            );
                          }
                          return (
                            <td key={action} className="py-2 pr-4">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={permission.has_permission}
                                onChange={() => togglePerm(resource, action)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
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
