import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Snackbar, SnackbarType } from '@/components/snackbar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  getAllRole,
  createRole,
  updateRole,
  updateRolePermissions,
} from '@/store/role/actions/roleActions';
import { syncPermissions } from '@/store/permission/actions/permissionActions';
import { setPermissionPage } from '@/store/permission/slices/permissionSlice';

const AdminAccessPage: React.FC = () => {
  const role = useUserRole();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const hasClickedTab = useRef(false);

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
  const [pageSize] = useState(10);
  const [activeOnly] = useState(false);
  const rolesLoadedRef = useRef(false);
  const initialPageRef = useRef(1);

  // Fetch roles when Access Control page loads (default Roles tab) or when Roles tab is clicked
  useEffect(() => {
    if (activeTab === 'roles' && !rolesLoadedRef.current && !loading) {
      rolesLoadedRef.current = true;
      initialPageRef.current = page;
      dispatch(
        getAllRole({ page: 1, page_size: pageSize, active_only: activeOnly }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeTab, activeOnly, pageSize, loading]);

  // Re-fetch roles when page changes (only if roles tab is active, already loaded, and page actually changed)
  useEffect(() => {
    if (
      activeTab === 'roles' &&
      rolesLoadedRef.current &&
      page !== initialPageRef.current
    ) {
      dispatch(
        getAllRole({ page, page_size: pageSize, active_only: activeOnly }),
      );
      initialPageRef.current = page;
    }
  }, [dispatch, page, activeTab, activeOnly, pageSize]);

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
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<{
    id: number;
    name: string;
    description?: string;
    active?: boolean;
  } | null>(null);

  // Dynamic permission matrix based on API response
  type PermissionMatrix = Record<
    string,
    Record<
      string,
      {
        permission_id: number;
        role_permission_id: number | null;
        has_permission: boolean;
      }
    >
  >;
  const [permMatrix, setPermMatrix] = useState<PermissionMatrix>({});
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);

  // Permissions from Redux
  const {
    permissions,
    loading: scanning,
    total: permTotal,
    page: permPage,
    pageSize: permPageSize,
    totalPages: permTotalPages,
  } = useAppSelector((state) => state.permission);

  // Client-side pagination for permissions
  const startIndex = (permPage - 1) * permPageSize;
  const endIndex = startIndex + permPageSize;
  const paginatedPermissions = permissions.slice(startIndex, endIndex);

  const permissionsLoadedRef = useRef(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: SnackbarType;
  } | null>(null);

  // Fetch permissions automatically when permissions tab is clicked
  useEffect(() => {
    if (
      activeTab === 'permissions' &&
      hasClickedTab.current &&
      !permissionsLoadedRef.current &&
      !scanning
    ) {
      permissionsLoadedRef.current = true;
      dispatch(syncPermissions());
    }
  }, [dispatch, activeTab, scanning]);

  const openEdit = (r: {
    id: number;
    name: string;
    description?: string;
    active?: boolean;
  }) => {
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
              role_permission_id:
                resourceData.actions[actionName].role_permission_id,
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
    // Reset the ref to allow re-scanning
    permissionsLoadedRef.current = false;
    dispatch(syncPermissions());
  };

  return (
    <>
      <MainLayout role={role}>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="px-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Access Control
              </h1>
              <p className="mt-0.5 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                Manage roles and permissions
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto px-0">
            <Button
              variant={activeTab === 'roles' ? 'secondary' : 'outline'}
              onClick={() => {
                hasClickedTab.current = true;
                // Reset roles loaded state when switching to roles tab to allow re-fetch
                if (activeTab !== 'roles') {
                  rolesLoadedRef.current = false;
                }
                setActiveTab('roles');
              }}
              className={`h-8 px-4 text-sm rounded-full transition-colors ${
                activeTab === 'roles'
                  ? 'bg-[#4F39F6] text-white hover:bg-[#3D2DC4]'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Roles
            </Button>
            <Button
              variant={activeTab === 'permissions' ? 'secondary' : 'outline'}
              onClick={() => {
                hasClickedTab.current = true;
                setActiveTab('permissions');
              }}
              className={`h-8 px-4 text-sm rounded-full transition-colors ${
                activeTab === 'permissions'
                  ? 'bg-[#4F39F6] text-white hover:bg-[#3D2DC4]'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Permissions
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'roles' ? (
            <div className="space-y-3">
              {/* Secondary tabs removed */}
              {/* Search and Add Button */}
              <div className="flex flex-col gap-2 py-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:space-x-3 sm:w-auto">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-200">
                      Select All
                    </label>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 transform text-gray-400 sm:h-3.5 sm:w-3.5" />
                    <Input
                      type="text"
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8 w-full pl-7 text-xs sm:h-8 sm:w-48 sm:text-sm md:w-64 sm:pl-8"
                    />
                  </div>
                </div>
                <Button
                  className="h-8 w-full bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700 sm:w-auto sm:text-sm"
                  disabled={loading}
                  onClick={() => {
                    setIsCreating(true);
                    setCurrentRole({ id: 0, name: '', active: true });
                    setIsEditOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />{' '}
                  Add Role
                </Button>
              </div>
              {/* Roles Table */}
              <div className="overflow-hidden rounded-lg border-t border-gray-200 bg-white dark:border-white/10 dark:bg-slate-800">
                <div className="-mx-2 overflow-x-auto sm:mx-0">
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
                              {role.createdAt || role.created_at || ''}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-xs text-gray-900 dark:text-gray-100">
                              {role.updatedAt || role.updated_at || ''}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            <DropdownMenu
                              open={actionMenuOpenId === role.id}
                              onOpenChange={(o) =>
                                setActionMenuOpenId(o ? role.id : null)
                              }
                            >
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEdit(role)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openManagePermissions(role)}
                                >
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
              <div className="flex flex-col gap-2 border-t border-gray-200 py-2 text-xs text-gray-700 dark:border-white/10 dark:text-gray-200 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                <div>
                  Page {page} • {rolesToRender.length} of{' '}
                  {total || rolesToRender.length} roles
                </div>
                <div className="flex w-full items-center justify-center space-x-2 sm:w-auto sm:justify-end">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    className="h-8 flex-1 px-3 text-xs text-gray-700 sm:flex-none sm:text-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={rolesToRender.length < pageSize}
                    className="h-8 flex-1 px-3 text-xs text-gray-700 sm:flex-none sm:text-sm"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">
                  Permissions
                </h2>
                <Button
                  className="h-8 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700 sm:text-sm"
                  disabled={scanning}
                  onClick={handleScanPermissions}
                >
                  <Search className="h-3.5 w-3.5 mr-1.5" />{' '}
                  {scanning ? 'Scanning...' : 'Scan Permissions'}
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
                        <td
                          colSpan={3}
                          className="py-6 text-center text-gray-500 text-sm"
                        >
                          No permissions loaded. Click &quot;Scan
                          Permissions&quot; to fetch from API.
                        </td>
                      </tr>
                    ) : (
                      paginatedPermissions.map((perm) => (
                        <tr
                          key={perm.key}
                          className="border-b border-gray-200 dark:border-white/10"
                        >
                          <td className="py-2 pr-4 text-xs font-medium capitalize">
                            {perm.module}
                          </td>
                          <td className="py-2 pr-4 text-xs capitalize">
                            {perm.action}
                          </td>
                          <td className="py-2 pr-4 text-xs font-mono text-gray-600 dark:text-gray-400">
                            {perm.key}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {permissions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 sm:py-1 border-t border-gray-200 dark:border-white/10 mt-3 sm:mt-4">
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                    Page {permPage} • {paginatedPermissions.length} of{' '}
                    {permTotal} permissions
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      disabled={permPage <= 1}
                      className="text-gray-700 h-7 sm:h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-none"
                      onClick={() =>
                        dispatch(setPermissionPage(Math.max(1, permPage - 1)))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={permPage >= permTotalPages}
                      className="text-gray-700 h-7 sm:h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-none"
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
          <DialogContent className="w-[95vw] sm:w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {isCreating ? 'Create Role' : 'Edit Role'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                  Role Name
                </label>
                <Input
                  value={currentRole?.name || ''}
                  onChange={(e) =>
                    setCurrentRole((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                          }
                        : { id: 0, name: e.target.value, active: true },
                    )
                  }
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!currentRole?.active}
                  onChange={(e) =>
                    setCurrentRole((prev) =>
                      prev
                        ? {
                            ...prev,
                            active: e.target.checked,
                          }
                        : { id: 0, name: '', active: e.target.checked },
                    )
                  }
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                  Active
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSaving || !currentRole?.name}
                  onClick={async () => {
                    if (!currentRole?.name) return;
                    // For update, require id to be greater than 0
                    if (
                      !isCreating &&
                      (!currentRole?.id || currentRole.id <= 0)
                    )
                      return;
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
                        setToast({
                          message: 'Role created successfully',
                          type: 'success',
                        });
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
                        setToast({
                          message: 'Role updated successfully',
                          type: 'success',
                        });
                      }
                      await dispatch(
                        getAllRole({
                          page,
                          page_size: pageSize,
                          active_only: activeOnly,
                        }),
                      );
                      setIsEditOpen(false);
                      setCurrentRole(null);
                      setIsCreating(false);
                    } catch (error) {
                      console.error('Error saving role:', error);
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : 'Unknown error';
                      setToast({
                        message:
                          errorMessage ||
                          `Failed to ${isCreating ? 'create' : 'update'} role`,
                        type: 'error',
                      });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm"
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
          <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Manage Permissions — {currentRole?.name || ''}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              {Object.keys(permMatrix).length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  No permissions available for this role
                </p>
              ) : (
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-4">Resource</th>
                      {(() => {
                        // Get all unique actions across all resources
                        const allActions = new Set<string>();
                        Object.values(permMatrix).forEach((resource) => {
                          Object.keys(resource).forEach((action) =>
                            allActions.add(action),
                          );
                        });
                        return Array.from(allActions).sort();
                      })().map((action) => (
                        <th key={action} className="py-2 pr-4 capitalize">
                          {action}
                        </th>
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
                        <tr
                          key={resource}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <td className="py-2 pr-4 font-medium capitalize text-gray-900 dark:text-gray-100">
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
              <Button
                variant="outline"
                onClick={() => setIsPermOpen(false)}
                disabled={isSavingPermissions}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!currentRole?.id) return;

                  // Collect all permission_ids where has_permission is true
                  const permissionIds: number[] = [];
                  Object.values(permMatrix).forEach((resource) => {
                    Object.values(resource).forEach((permission) => {
                      if (
                        permission.has_permission &&
                        permission.permission_id
                      ) {
                        permissionIds.push(permission.permission_id);
                      }
                    });
                  });

                  try {
                    setIsSavingPermissions(true);
                    await dispatch(
                      updateRolePermissions({
                        id: currentRole.id,
                        permissionIds,
                      }),
                    ).unwrap();

                    setToast({
                      message: 'Permissions updated successfully',
                      type: 'success',
                    });

                    // Refresh roles list to get updated permissions
                    await dispatch(
                      getAllRole({
                        page,
                        page_size: pageSize,
                        active_only: activeOnly,
                      }),
                    );

                    setIsPermOpen(false);
                  } catch (error) {
                    console.error('Error updating permissions:', error);
                    const errorMessage =
                      error instanceof Error ? error.message : 'Unknown error';
                    setToast({
                      message: errorMessage || 'Failed to update permissions',
                      type: 'error',
                    });
                  } finally {
                    setIsSavingPermissions(false);
                  }
                }}
                disabled={isSavingPermissions}
              >
                {isSavingPermissions ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
      {toast && (
        <Snackbar
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default AdminAccessPage;
