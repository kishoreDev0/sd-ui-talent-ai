import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Loader2, MoreVertical } from 'lucide-react';
import type { JobCategory } from '@/store/jobCategory/types/jobCategoryTypes';
import {
  fetchJobCategories,
  createJobCategoryAsync,
  updateJobCategoryAsync,
  deleteJobCategoryAsync,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';

const JobCategories: React.FC = () => {
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.jobCategory);
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    'create' | 'view' | 'edit' | 'delete'
  >('view');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(
    null,
  );
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowActionId, setRowActionId] = useState<number | null>(null);

  const dialogTitle = useMemo(() => {
    switch (dialogMode) {
      case 'create':
        return 'Add job category';
      case 'edit':
        return 'Edit job category';
      case 'delete':
        return 'Delete job category';
      default:
        return 'Category details';
    }
  }, [dialogMode]);

  useEffect(() => {
    dispatch(fetchJobCategories());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    let result = items;

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((category) => {
        return (
          category.name?.toLowerCase().includes(term) ||
          category.description?.toLowerCase().includes(term) ||
          category.created_by?.toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [items, searchTerm]);

  const selectAll =
    filteredCategories.length > 0 &&
    filteredCategories.every((category) =>
      selectedItems.includes(Number(category.id)),
    );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems((prev) =>
        prev.filter(
          (id) =>
            !filteredCategories.some(
              (category) => Number(category.id) === Number(id),
            ),
        ),
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        ...filteredCategories
          .map((category) => Number(category.id))
          .filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) {
      return '—';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) {
      return 'Updated just now';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return 'Updated just now';
    }
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) {
      return 'Updated just now';
    }
    if (diffMinutes < 60) {
      return `Updated ${diffMinutes}m ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Updated ${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `Updated ${diffDays}d ago`;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setDialogMode('view');
    setFormState({
      name: '',
      description: '',
      is_active: true,
    });
    setIsSubmitting(false);
  };

  const getErrorMessage = (err: unknown): string => {
    if (!err) {
      return 'Something went wrong';
    }
    if (typeof err === 'string') {
      return err;
    }
    if (err instanceof Error) {
      return err.message;
    }
    if (err && typeof err === 'object') {
      const record = err as Record<string, unknown>;
      const messageCandidate = record.message;
      const errorCandidate = record.error;
      const detailCandidate = record.detail;

      if (typeof messageCandidate === 'string') {
        return messageCandidate;
      }
      if (typeof errorCandidate === 'string') {
        return errorCandidate;
      }
      if (typeof detailCandidate === 'string') {
        return detailCandidate;
      }
    }
    return 'Failed to complete the action.';
  };

  const scheduleDialogOpen = useCallback(
    (
      mode: 'create' | 'view' | 'edit' | 'delete',
      category: JobCategory | null,
      nextFormState: { name: string; description: string; is_active: boolean },
    ) => {
      window.setTimeout(() => {
        setDialogMode(mode);
        setSelectedCategory(category);
        setFormState(nextFormState);
        setDialogOpen(true);
      }, 0);
    },
    [],
  );

  const handleCreateCategory = () => {
    scheduleDialogOpen('create', null, {
      name: '',
      description: '',
      is_active: true,
    });
  };

  const handleViewCategory = (category: JobCategory) => {
    scheduleDialogOpen('view', category, {
      name: category.name ?? '',
      description: category.description ?? '',
      is_active: category.is_active !== false,
    });
  };

  const handleEditCategory = (category: JobCategory) => {
    scheduleDialogOpen('edit', category, {
      name: category.name ?? '',
      description: category.description ?? '',
      is_active: category.is_active !== false,
    });
  };

  const handleToggleStatus = async (category: JobCategory) => {
    setRowActionId(Number(category.id));
    try {
      await dispatch(
        updateJobCategoryAsync({
          id: Number(category.id),
          name: category.name ?? '',
          description: category.description ?? '',
          is_active: !(category.is_active !== false),
        }),
      ).unwrap();
      showToast('Category status updated successfully', 'success');
      dispatch(fetchJobCategories());
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setRowActionId(null);
    }
  };

  const handleDeleteCategory = (category: JobCategory) => {
    scheduleDialogOpen('delete', category, {
      name: category.name ?? '',
      description: category.description ?? '',
      is_active: category.is_active !== false,
    });
  };

  const handleDialogSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (dialogMode !== 'create' && dialogMode !== 'edit') {
      return;
    }

    if (!formState.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await dispatch(
          createJobCategoryAsync({
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            is_active: formState.is_active,
          }),
        ).unwrap();
        showToast('Category created successfully', 'success');
      } else if (dialogMode === 'edit' && selectedCategory) {
        await dispatch(
          updateJobCategoryAsync({
            id: Number(selectedCategory.id),
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            is_active: formState.is_active,
          }),
        ).unwrap();
        showToast('Category updated successfully', 'success');
      }
      resetDialog();
      dispatch(fetchJobCategories());
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) {
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(
        deleteJobCategoryAsync(Number(selectedCategory.id)),
      ).unwrap();
      showToast('Category deleted successfully', 'success');
      resetDialog();
      dispatch(fetchJobCategories());
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout role={role}>
      <div className="space-y-4">
        {/* Header */}
        <div className="px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900">Job Categories</h1>
          <p className="text-gray-600 text-sm">
            Manage job categories and their settings.
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Select All
              </label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search job categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          <Button
            className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
            onClick={handleCreateCategory}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CATEGORY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DESCRIPTION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED BY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIVE
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Loading categories…
                    </td>
                  </tr>
                )}
                {!isLoading && filteredCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No categories found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(Number(category.id))}
                          onChange={() => handleSelectItem(Number(category.id))}
                          className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category.created_by ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={category.is_active !== false}
                            className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            {category.is_active !== false
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-900"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewCategory(category)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditCategory(category)}
                            >
                              Edit category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(category)}
                              disabled={rowActionId === Number(category.id)}
                            >
                              {rowActionId === Number(category.id)
                                ? 'Updating...'
                                : category.is_active !== false
                                  ? 'Mark inactive'
                                  : 'Mark active'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              Delete
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
      </div>

      {dialogOpen && (
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              resetDialog();
            } else {
              setDialogOpen(true);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              {dialogMode === 'delete' ? (
                <DialogDescription>
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">
                    {selectedCategory?.name ?? 'this category'}
                  </span>
                  ? This action cannot be undone.
                </DialogDescription>
              ) : dialogMode === 'view' ? (
                <DialogDescription>
                  Review job category details and status.
                </DialogDescription>
              ) : (
                <DialogDescription>
                  Provide the category details and choose whether it should be
                  active.
                </DialogDescription>
              )}
            </DialogHeader>

            {dialogMode === 'view' && selectedCategory && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-500">
                    Category name
                  </Label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedCategory.name ?? '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500">
                    Description
                  </Label>
                  <p className="mt-1 text-sm text-gray-700">
                    {selectedCategory.description ?? '—'}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Status
                    </p>
                    <p className="text-sm text-gray-900">
                      {selectedCategory.is_active !== false
                        ? 'Active'
                        : 'Inactive'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      selectedCategory.is_active !== false
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {selectedCategory.is_active !== false
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Created on
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedCategory.created_at
                        ? formatDate(selectedCategory.created_at)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Updated
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedCategory.updated_at
                        ? formatRelativeTime(selectedCategory.updated_at)
                        : '—'}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetDialog}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}

            {(dialogMode === 'create' || dialogMode === 'edit') && (
              <form
                className="space-y-4"
                onSubmit={handleDialogSubmit}
                autoComplete="off"
              >
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category name</Label>
                  <Input
                    id="category-name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Product Design"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Describe what roles belong to this category"
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active</p>
                    <p className="text-xs text-gray-500">
                      Toggle off to hide this category from new assignments.
                    </p>
                  </div>
                  <Switch
                    checked={formState.is_active}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({
                        ...prev,
                        is_active: checked,
                      }))
                    }
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetDialog}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#4F39F6] text-white hover:bg-[#3D2DC4]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : dialogMode === 'create' ? (
                      'Create category'
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {dialogMode === 'delete' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  This will permanently remove the job category{' '}
                  <span className="font-semibold">
                    {selectedCategory?.name ?? 'Untitled'}
                  </span>{' '}
                  and cannot be undone.
                </p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={resetDialog}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handleConfirmDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete category'
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default JobCategories;
