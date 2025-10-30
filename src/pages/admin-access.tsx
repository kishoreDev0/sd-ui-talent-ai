import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store';
import { getAllRole, createRole } from '@/store/role/actions/roleActions';

const AdminAccessPage: React.FC = () => {
  const role = useUserRole();

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
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);

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

        {/* Top toggle removed (always show Roles) */}

        {/* Content */}
        {true ? (
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
        ) : null}
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
                  if (!currentRole?.name) return;
                  if (isCreating) {
                    try {
                      setIsSaving(true);
                      await dispatch(
                        createRole({
                          payload: {
                            name: currentRole.name,
                            active: currentRole?.active ?? true,
                          },
                        }),
                      ).unwrap();
                      await dispatch(getAllRole());
                      setIsEditOpen(false);
                    } finally {
                      setIsSaving(false);
                    }
                  } else {
                    setIsEditOpen(false);
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
