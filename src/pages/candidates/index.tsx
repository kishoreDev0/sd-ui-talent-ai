import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/utils/getUserRole';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchCandidatesAsync,
  deleteCandidateAsync,
} from '@/store/candidate/actions/candidateActions';
import ConfirmationModal from '@/components/confirmation-modal';

type CandidateRow = {
  id: number;
  name: string;
  email: string;
  status: string;
  aiRating: number;
  appliedOn: string;
  appliedTimestamp: number;
  tags: string[];
};

const formatAppliedDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const CandidatesPage: React.FC = () => {
  const navigate = useNavigate();
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const { items, isLoading, page, pageSize, total, totalPages } =
    useAppSelector((state) => state.candidate);

  const [searchTerm, setSearchTerm] = useState('');
  const [nameSortOrder, setNameSortOrder] = useState<'asc' | 'desc' | null>(
    null,
  );
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc' | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(page || 1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const pageSizeValue = pageSize || 10;

  useEffect(() => {
    if (page && page !== currentPage) {
      setCurrentPage(page);
    }
  }, [page, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(
        fetchCandidatesAsync({
          page: currentPage,
          pageSize: pageSizeValue,
          search: searchTerm.trim() || undefined,
        }),
      );
    }, 400);

    return () => clearTimeout(handler);
  }, [dispatch, currentPage, pageSizeValue, searchTerm]);

  const candidateRows = useMemo<CandidateRow[]>(() => {
    if (!items || items.length === 0) return [];

    return items.map((candidate) => {
      const fullName =
        [candidate.first_name, candidate.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        candidate.resume_title ||
        candidate.email;

      const status = candidate.direct_interview
        ? 'Interview'
        : candidate.rating >= 80
          ? 'Recommended'
          : candidate.rating >= 60
            ? 'Opened'
            : 'New';

      const tagsSet = new Set<string>();
      if (candidate.domain_expertise) tagsSet.add(candidate.domain_expertise);
      if (candidate.current_company) tagsSet.add(candidate.current_company);
      if (candidate.source) tagsSet.add(candidate.source);
      candidate.major_skills?.forEach((skill) => tagsSet.add(skill.name));
      candidate.skills?.slice(0, 3).forEach((skill) => tagsSet.add(skill.name));

      return {
        id: candidate.id,
        name: fullName,
        email: candidate.email,
        status,
        aiRating: candidate.rating ?? 0,
        appliedOn: formatAppliedDate(candidate.created_at),
        appliedTimestamp: candidate.created_at
          ? Date.parse(candidate.created_at)
          : 0,
        tags: Array.from(tagsSet).filter(Boolean),
      };
    });
  }, [items]);

  const sortedCandidates = useMemo(() => {
    const rows = [...candidateRows];

    if (nameSortOrder) {
      rows.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return nameSortOrder === 'asc' ? comparison : -comparison;
      });
    }

    if (dateSortOrder) {
      rows.sort((a, b) => {
        const comparison =
          (a.appliedTimestamp ?? 0) - (b.appliedTimestamp ?? 0);
        return dateSortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return rows;
  }, [candidateRows, nameSortOrder, dateSortOrder]);

  const totalRecords = total ?? sortedCandidates.length;
  const computedTotalPages =
    totalPages ??
    (totalRecords > 0 ? Math.ceil(totalRecords / pageSizeValue) : 0);
  const paginationTotalPages = Math.max(computedTotalPages, 1);
  const showPagination = paginationTotalPages > 1;
  const rangeStart =
    totalRecords === 0 ? 0 : (currentPage - 1) * pageSizeValue + 1;
  const rangeEnd =
    totalRecords === 0
      ? 0
      : Math.min(
          (currentPage - 1) * pageSizeValue + sortedCandidates.length,
          totalRecords,
        );

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-indigo-500',
      'bg-amber-600',
    ];
    const index =
      name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  const handleDeleteClick = (candidateId: number, candidateName: string) => {
    setCandidateToDelete({ id: candidateId, name: candidateName });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;

    try {
      await dispatch(deleteCandidateAsync(candidateToDelete.id)).unwrap();
      // Refresh the candidates list after successful deletion
      dispatch(
        fetchCandidatesAsync({
          page: currentPage,
          pageSize: pageSizeValue,
          search: searchTerm.trim() || undefined,
        }),
      );
      setDeleteModalOpen(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      // You can add toast notification here if needed
      setDeleteModalOpen(false);
      setCandidateToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCandidateToDelete(null);
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'New':
        return 'bg-green-100 text-green-700';
      case 'Opened':
        return 'bg-gray-100 text-gray-700';
      case 'Interview':
        return 'bg-yellow-100 text-yellow-700';
      case 'Recommended':
        return 'bg-indigo-100 text-indigo-700';
      case 'Accepted':
        return 'bg-blue-100 text-blue-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Offer Sent':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTagColor = (tag: string): string => {
    if (tag.includes('Potential') || tag.includes('fit')) {
      return 'bg-orange-100 text-orange-700';
    }
    if (tag.includes('Average')) {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (
      tag.includes('Strong') ||
      tag.includes('Good') ||
      tag.includes('Technical')
    ) {
      return 'bg-blue-100 text-blue-700';
    }
    if (tag.includes('No')) {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <MainLayout role={role}>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-2 pb-12 pt-2">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Candidates
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse and manage all the candidates for this position
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-slate-200"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/candidates/register')}
            >
              Register Candidate
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {totalRecords > 0
              ? `Showing ${rangeStart} to ${rangeEnd} of ${totalRecords} results${
                  showPagination
                    ? ` (Page ${currentPage} of ${paginationTotalPages})`
                    : ''
                }`
              : 'No candidates found'}
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search for a candidate..."
                className="h-10 rounded-lg border border-slate-200 pl-10 text-sm focus:border-slate-400 focus:ring-slate-400"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-slate-200"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() =>
                        setNameSortOrder(
                          nameSortOrder === 'asc'
                            ? 'desc'
                            : nameSortOrder === 'desc'
                              ? null
                              : 'asc',
                        )
                      }
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Name
                      {nameSortOrder === 'asc' && (
                        <ChevronUp className="h-3 w-3" />
                      )}
                      {nameSortOrder === 'desc' && (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    AI Rating
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() =>
                        setDateSortOrder(
                          dateSortOrder === 'asc'
                            ? 'desc'
                            : dateSortOrder === 'desc'
                              ? null
                              : 'asc',
                        )
                      }
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Applied on
                      {dateSortOrder === 'asc' && (
                        <ChevronUp className="h-3 w-3" />
                      )}
                      {dateSortOrder === 'desc' && (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Tags
                  </th>
                  <th className="w-10 px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-xs text-slate-500"
                    >
                      Loading candidates...
                    </td>
                  </tr>
                ) : sortedCandidates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-xs text-slate-500"
                    >
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  sortedCandidates.map((candidate) => {
                    const displayedTags = candidate.tags.slice(0, 2);
                    const remainingTags =
                      candidate.tags.length - displayedTags.length;

                    return (
                      <tr
                        key={candidate.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(
                                candidate.name,
                              )}`}
                            >
                              {getInitials(candidate.name)}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">
                                {candidate.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {candidate.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeColor(
                              candidate.status,
                            )}`}
                          >
                            {candidate.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-medium text-slate-900">
                            {candidate.aiRating}%
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-slate-600">
                            {candidate.appliedOn}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {candidate.tags.length === 0 ? (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                No tags
                              </span>
                            ) : (
                              <>
                                {displayedTags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTagColor(
                                      tag,
                                    )}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {remainingTags > 0 && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                    +{remainingTags}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 border-slate-200 text-[10px] px-2"
                            >
                              <FileText className="mr-1 h-3 w-3" />
                              View CV
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="rounded p-1 hover:bg-slate-100"
                                >
                                  <MoreVertical className="h-3.5 w-3.5 text-slate-600" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Add view profile functionality if needed
                                  }}
                                >
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Add edit functionality if needed
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteClick(
                                      candidate.id,
                                      candidate.name,
                                    )
                                  }
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>
                Showing {rangeStart} to {rangeEnd} of {totalRecords} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 border-slate-200 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: paginationTotalPages },
                  (_, i) => i + 1,
                ).map((pageNumber) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === paginationTotalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-purple-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="px-2 text-xs text-slate-500"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(paginationTotalPages, prev + 1),
                  )
                }
                disabled={currentPage === paginationTotalPages}
                className="h-8 border-slate-200 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        labelHeading="Delete Candidate"
        label={`Are you sure you want to delete "${candidateToDelete?.name}"? This action cannot be undone.`}
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        onClose={handleDeleteCancel}
      />
    </MainLayout>
  );
};

export default CandidatesPage;
