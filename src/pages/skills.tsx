import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Loader2, MoreVertical } from 'lucide-react';
import {
  createSkillAsync,
  deleteSkillAsync,
  fetchSkills,
  updateSkillAsync,
  useAppDispatch,
  useAppSelector,
  fetchMajorSkills,
} from '@/store';
import type { Skill } from '@/store/skill/types/skillTypes';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DialogMode = 'create' | 'edit' | 'delete';

interface SkillFormState {
  name: string;
  description: string;
  major_skill_id: number | '';
  is_active: boolean;
}

const emptyForm: SkillFormState = {
  name: '',
  description: '',
  major_skill_id: '',
  is_active: true,
};

const SkillsPage: React.FC = () => {
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { items: skills, isLoading, error } = useAppSelector((state) => state.skill);
  const { items: majorSkills } = useAppSelector((state) => state.majorSkill);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajorSkill, setSelectedMajorSkill] = useState<number | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<SkillFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [rowActionId, setRowActionId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchSkills());
    dispatch(fetchMajorSkills());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const filteredSkills = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return skills.filter((skill) => {
      const matchesSearch =
        !term ||
        skill.name?.toLowerCase().includes(term) ||
        skill.description?.toLowerCase().includes(term);
      const matchesMajorSkill =
        selectedMajorSkill === 'all' ||
        Number(skill.major_skill_id) === Number(selectedMajorSkill);
      return matchesSearch && matchesMajorSkill;
    });
  }, [skills, searchTerm, selectedMajorSkill]);

  const allSelected =
    filteredSkills.length > 0 &&
    filteredSkills.every((skill) => selectedItems.includes(Number(skill.id)));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter(
          (id) =>
            !filteredSkills.some((skill) => Number(skill.id) === Number(id)),
        ),
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        ...filteredSkills
          .map((skill) => Number(skill.id))
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
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openDialog = (mode: DialogMode, skill: Skill | null = null) => {
    window.setTimeout(() => {
      setDialogMode(mode);
      setSelectedSkill(skill);
      if (skill) {
        setFormState({
          name: skill.name ?? '',
          description: skill.description ?? '',
          major_skill_id: Number(skill.major_skill_id),
          is_active: skill.is_active !== false,
        });
      } else {
        setFormState(emptyForm);
      }
      setDialogOpen(true);
    }, 0);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedSkill(null);
    setFormState(emptyForm);
    setIsSubmitting(false);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      showToast('Skill name is required', 'error');
      return;
    }
    if (!formState.major_skill_id) {
      showToast('Select a major skill', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await dispatch(
          createSkillAsync({
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            major_skill_id: Number(formState.major_skill_id),
            is_active: formState.is_active,
          }),
        ).unwrap();
        showToast('Skill created successfully', 'success');
      } else if (dialogMode === 'edit' && selectedSkill) {
        await dispatch(
          updateSkillAsync({
            id: Number(selectedSkill.id),
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            major_skill_id: Number(formState.major_skill_id),
            is_active: formState.is_active,
          }),
        ).unwrap();
        showToast('Skill updated successfully', 'success');
      }
      closeDialog();
      dispatch(fetchSkills());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save skill',
        'error',
      );
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedSkill) {
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(deleteSkillAsync(Number(selectedSkill.id))).unwrap();
      showToast('Skill deleted successfully', 'success');
      closeDialog();
      dispatch(fetchSkills());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete skill',
        'error',
      );
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (skill: Skill) => {
    setRowActionId(Number(skill.id));
    try {
      await dispatch(
        updateSkillAsync({
          id: Number(skill.id),
          name: skill.name ?? '',
          description: skill.description ?? '',
          major_skill_id: Number(skill.major_skill_id),
          is_active: !(skill.is_active !== false),
        }),
      ).unwrap();
      showToast('Skill status updated', 'success');
      dispatch(fetchSkills());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update status',
        'error',
      );
    } finally {
      setRowActionId(null);
    }
  };

  const dialogTitle =
    dialogMode === 'create'
      ? 'Add skill'
      : dialogMode === 'edit'
        ? 'Edit skill'
        : 'Delete skill';

  return (
    <MainLayout role={role}>
      <div className="space-y-4">
        <div className="px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-600 text-sm">
            Keep individual skills aligned with your major skill taxonomy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-4 py-2">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search skills..."
                className="w-80 pl-10"
              />
            </div>
          </div>
          <Select
            value={String(selectedMajorSkill)}
            onValueChange={(value) =>
              setSelectedMajorSkill(value === 'all' ? 'all' : Number(value))
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All major skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All major skills</SelectItem>
              {majorSkills.map((item: MajorSkill) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button
              className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
              onClick={() => openDialog('create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Skill
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Major Skill
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#4F39F6]" />
                        <span>Loading skills...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSkills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                      No skills found. Try adjusting your filters or add a new skill.
                    </td>
                  </tr>
                ) : (
                  filteredSkills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(Number(skill.id))}
                          onChange={() => handleSelectItem(Number(skill.id))}
                          className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {skill.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <p className="max-w-md line-clamp-2">
                          {skill.description ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {skill.major_skill?.name ||
                          majorSkills.find((ms) => ms.id === skill.major_skill_id)?.name ||
                          '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            skill.is_active !== false
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {skill.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(skill.updated_at)}
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
                              onClick={() => openDialog('edit', skill)}
                            >
                              Edit skill
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleStatus(skill)}
                              disabled={rowActionId === Number(skill.id)}
                            >
                              {rowActionId === Number(skill.id)
                                ? 'Updating...'
                                : skill.is_active !== false
                                  ? 'Mark inactive'
                                  : 'Mark active'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => openDialog('delete', skill)}
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
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'delete'
                ? 'Deleting a skill cannot be undone.'
                : 'Provide the details below to manage skills.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'delete' ? (
            <>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {selectedSkill?.name ?? 'this skill'}
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
                <Label htmlFor="skill-name">Name</Label>
                <Input
                  id="skill-name"
                  placeholder="Enter skill name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-major-skill">Major skill</Label>
                <Select
                  value={
                    formState.major_skill_id === ''
                      ? ''
                      : String(formState.major_skill_id)
                  }
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      major_skill_id: value ? Number(value) : '',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select major skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {majorSkills.map((item: MajorSkill) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-description">Description</Label>
                <Textarea
                  id="skill-description"
                  placeholder="Describe the skill..."
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="space-y-1">
                  <Label htmlFor="skill-active" className="text-sm font-medium">
                    Active
                  </Label>
                  <p className="text-xs text-gray-500">
                    Toggle to control whether the skill can be assigned.
                  </p>
                </div>
                <Switch
                  id="skill-active"
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

export default SkillsPage;

