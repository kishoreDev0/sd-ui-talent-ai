import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Loader2, MoreVertical } from 'lucide-react';
import {
  createMajorSkillAsync,
  deleteMajorSkillAsync,
  fetchMajorSkills,
  updateMajorSkillAsync,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import type { MajorSkill } from '@/store/majorSkill/types/majorSkillTypes';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DialogMode = 'create' | 'edit' | 'delete';

const emptyFormState = {
  name: '',
  description: '',
  is_active: true,
};

const MajorSkills: React.FC = () => {
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { items, isLoading, error } = useAppSelector((state) => state.majorSkill);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajorSkill, setSelectedMajorSkill] = useState<MajorSkill | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState(emptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
       const [selectedItems, setSelectedItems] = useState<number[]>([]);
       const [rowActionId, setRowActionId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchMajorSkills());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      return (
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        String(item.created_by ?? '').toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm]);

       const selectAll =
         filteredItems.length > 0 &&
         filteredItems.every((item) => selectedItems.includes(Number(item.id)));

       const handleSelectAll = () => {
         if (selectAll) {
           setSelectedItems((prev) =>
             prev.filter(
               (id) =>
                 !filteredItems.some((item) => Number(item.id) === Number(id)),
             ),
           );
         } else {
           setSelectedItems((prev) => [
             ...prev,
             ...filteredItems
               .map((item) => Number(item.id))
               .filter((id) => !prev.includes(id)),
           ]);
         }
       };

       const handleSelectItem = (id: number) => {
         setSelectedItems((prev) =>
           prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
         );
       };

       const openDialog = (mode: DialogMode, majorSkill: MajorSkill | null = null) => {
         window.setTimeout(() => {
           setDialogMode(mode);
           setSelectedMajorSkill(majorSkill);
           if (majorSkill) {
             setFormState({
               name: majorSkill.name ?? '',
               description: majorSkill.description ?? '',
               is_active: majorSkill.is_active !== false,
             });
           } else {
             setFormState(emptyFormState);
           }
           setDialogOpen(true);
         }, 0);
       };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMajorSkill(null);
    setFormState(emptyFormState);
    setIsSubmitting(false);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      showToast('Major skill name is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await dispatch(
          createMajorSkillAsync({
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            is_active: formState.is_active,
          }),
        ).unwrap();
        showToast('Major skill created successfully', 'success');
      } else if (dialogMode === 'edit' && selectedMajorSkill) {
        await dispatch(
          updateMajorSkillAsync({
            id: Number(selectedMajorSkill.id),
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            is_active: formState.is_active,
          }),
        ).unwrap();
        showToast('Major skill updated successfully', 'success');
      }
      closeDialog();
      dispatch(fetchMajorSkills());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save major skill',
        'error',
      );
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMajorSkill) {
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(deleteMajorSkillAsync(Number(selectedMajorSkill.id))).unwrap();
      showToast('Major skill deleted successfully', 'success');
      closeDialog();
      dispatch(fetchMajorSkills());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete major skill',
        'error',
      );
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (majorSkill: MajorSkill) => {
         setRowActionId(Number(majorSkill.id));
    try {
      await dispatch(
        updateMajorSkillAsync({
          id: Number(majorSkill.id),
          name: majorSkill.name ?? '',
          description: majorSkill.description ?? '',
          is_active: !(majorSkill.is_active !== false),
        }),
      ).unwrap();
      showToast('Major skill status updated', 'success');
      dispatch(fetchMajorSkills());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update status',
        'error',
      );
         } finally {
           setRowActionId(null);
    }
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

  return (
    <MainLayout role={role}>
      <div className="space-y-4">
        <div className="px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900">Major Skills</h1>
          <p className="text-gray-600 text-sm">
            Manage major skills and keep your taxonomy up-to-date.
          </p>
        </div>

             <div className="flex items-center justify-between px-4 py-2">
               <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     checked={selectAll}
                     onChange={handleSelectAll}
                     className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                   />
                   <span className="text-sm font-medium text-gray-700">Select All</span>
                 </div>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                   <Input
                     value={searchTerm}
                     onChange={(event) => setSearchTerm(event.target.value)}
                     placeholder="Search major skills..."
                     className="w-80 pl-10"
                   />
                 </div>
               </div>
          <Button
            className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
            onClick={() => openDialog('create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Major Skill
          </Button>
        </div>

             <div className="border-t border-gray-200 bg-white">
          <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                <tr>
                       <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                         <input
                           type="checkbox"
                           checked={selectAll}
                           onChange={handleSelectAll}
                           className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                         />
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                         Major Skill
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                         Description
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                         Status
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                         Created
                       </th>
                       <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                         Actions
                       </th>
                </tr>
              </thead>
                   <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                         <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#4F39F6]" />
                        <span>Loading major skills...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                         <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      No major skills found. Try adjusting your search or add a new one.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                         <tr key={item.id} className="hover:bg-gray-50">
                           <td className="px-4 py-3">
                             <input
                               type="checkbox"
                               checked={selectedItems.includes(Number(item.id))}
                               onChange={() => handleSelectItem(Number(item.id))}
                               className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                             />
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap">
                             <span className="text-sm font-medium text-gray-900">
                               {item.name}
                             </span>
                           </td>
                           <td className="px-4 py-3">
                             <p className="max-w-md text-sm text-gray-700 line-clamp-2">
                               {item.description ?? '—'}
                             </p>
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap">
                             <span
                               className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                 item.is_active !== false
                                   ? 'bg-emerald-100 text-emerald-600'
                                   : 'bg-rose-100 text-rose-600'
                               }`}
                             >
                               {item.is_active !== false ? 'Active' : 'Inactive'}
                             </span>
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                             {formatDate(item.created_at)}
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
                                   onClick={() => openDialog('edit', item)}
                                 >
                                   Edit skill
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                   onClick={() => toggleStatus(item)}
                                   disabled={rowActionId === Number(item.id)}
                                 >
                                   {rowActionId === Number(item.id)
                                     ? 'Updating...'
                                     : item.is_active !== false
                                       ? 'Mark inactive'
                                       : 'Mark active'}
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator />
                                 <DropdownMenuItem
                                   className="text-red-600 focus:text-red-600"
                                   onClick={() => openDialog('delete', item)}
                                 >
                                   Delete
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                           </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? 'Add major skill'
                : dialogMode === 'edit'
                  ? 'Edit major skill'
                  : 'Delete major skill'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'delete'
                ? 'This action cannot be undone. The major skill will be permanently removed.'
                : 'Provide the details for the major skill.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'delete' ? (
            <>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {selectedMajorSkill?.name ?? 'this major skill'}
                </span>
                ?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-white" />
                  )}
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={submitForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="major-skill-name">Name</Label>
                <Input
                  id="major-skill-name"
                  placeholder="Enter major skill name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major-skill-description">Description</Label>
                <Textarea
                  id="major-skill-description"
                  placeholder="Describe the major skill..."
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="space-y-1">
                  <Label htmlFor="major-skill-active" className="text-sm font-medium">
                    Active
                  </Label>
                  <p className="text-xs text-gray-500">
                    Toggle to control whether this major skill is available for use.
                  </p>
                </div>
                <Switch
                  id="major-skill-active"
                  checked={formState.is_active}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-white" />
                  )}
                  {dialogMode === 'create' ? 'Create' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default MajorSkills;

