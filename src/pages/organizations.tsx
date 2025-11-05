import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppDispatch, useAppSelector } from '@/store';
import { Eye, Search, Plus, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import {
  Country,
  State,
  City,
  GetCountries,
  GetState,
  GetCity,
} from 'react-country-state-city';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/store/organization/actions/organizationActions';
import type { Organization } from '@/store/types/organization/organizationTypes';

const OrganizationsPage: React.FC = () => {
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const { organizations, loading, total, pageSize, totalPages } =
    useAppSelector((state) => state.organization);

  const roleId =
    user?.role?.id ??
    user?.role_id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role?.id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role_id;

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
  });
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await GetCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (selectedCountry) {
        setLoadingStates(true);
        try {
          const data = await GetState(selectedCountry.id);
          setStates(data);
        } catch (error) {
          console.error('Failed to load states:', error);
          setStates([]);
        } finally {
          setLoadingStates(false);
        }
      } else {
        setStates([]);
      }
      setSelectedState(null);
      setSelectedCity(null);
      setCities([]);
    };
    loadStates();
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (selectedState && selectedCountry) {
        setLoadingCities(true);
        try {
          const data = await GetCity(selectedCountry.id, selectedState.id);
          setCities(data);
        } catch (error) {
          console.error('Failed to load cities:', error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      } else {
        setCities([]);
      }
      setSelectedCity(null);
    };
    loadCities();
  }, [selectedState, selectedCountry]);

  const tabs = ['All', 'Active', 'Inactive', 'Recent'];

  // Fetch organizations on mount and when dependencies change
  useEffect(() => {
    if (roleId === 1) {
      const fetchData = async () => {
        try {
          await dispatch(
            getAllOrganizations({
              page: currentPage,
              page_size: 10,
              status:
                selectedTab !== 'All' ? selectedTab.toLowerCase() : undefined,
              search: searchTerm.trim() || undefined,
            }),
          ).unwrap();
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        }
      };
      fetchData();
    }
  }, [dispatch, currentPage, roleId, selectedTab, searchTerm]);

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput);
        // Reset to first page when searching
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  // Auto-load country/state/city when editing an organization
  useEffect(() => {
    if (
      isFormOpen &&
      isEditMode &&
      selectedOrganization &&
      countries.length > 0 &&
      !selectedCountry &&
      selectedOrganization.country
    ) {
      const foundCountry = countries.find(
        (c) =>
          c.name.toLowerCase() === selectedOrganization.country?.toLowerCase(),
      );
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        GetState(foundCountry.id)
          .then((countryStates) => {
            setStates(countryStates);
            if (selectedOrganization.state) {
              const foundState = countryStates.find(
                (s) =>
                  s.name.toLowerCase() ===
                  selectedOrganization.state?.toLowerCase(),
              );
              if (foundState) {
                setSelectedState(foundState);
                if (selectedOrganization.city) {
                  GetCity(foundCountry.id, foundState.id)
                    .then((stateCities) => {
                      setCities(stateCities);
                      const foundCity = stateCities.find(
                        (c) =>
                          c.name.toLowerCase() ===
                          selectedOrganization.city?.toLowerCase(),
                      );
                      if (foundCity) {
                        setSelectedCity(foundCity);
                      }
                    })
                    .catch((error) => {
                      console.error('Failed to load cities:', error);
                    });
                }
              }
            }
          })
          .catch((error) => {
            console.error('Failed to load states:', error);
          });
      }
    }
  }, [
    isFormOpen,
    isEditMode,
    selectedOrganization,
    countries,
    selectedCountry,
  ]);

  // Refresh function to manually fetch latest data
  const handleRefresh = async () => {
    try {
      await dispatch(
        getAllOrganizations({
          page: currentPage,
          page_size: 10,
          status: selectedTab !== 'All' ? selectedTab.toLowerCase() : undefined,
          search: searchTerm.trim() || undefined,
        }),
      ).unwrap();
    } catch (error) {
      console.error('Failed to refresh organizations:', error);
    }
  };

  // Filter organizations based on selected tab (for Recent tab only, as filtering is done server-side)
  // Search and status filtering are now handled by the API
  const filteredOrganizations = (() => {
    if (selectedTab === 'Recent') {
      // Sort by ID descending (assuming newer = higher ID) - client-side only
      return [...organizations].sort((a, b) => b.id - a.id);
    }
    // For other tabs, the API already filters by status and search
    return organizations;
  })();

  const handleViewDetails = (org: Organization) => {
    // Use the organization data directly from the list
    setSelectedOrganization(org);
    setIsDetailsOpen(true);
  };

  const handleEdit = async (org: Organization) => {
    setFormData({
      name: org.name || '',
      is_active:
        org.is_active ??
        (org.status?.toLowerCase() === 'active' ? true : false),
      address_line1: org.address_line1 || '',
      address_line2: org.address_line2 || '',
      city: org.city || '',
      state: org.state || '',
      country: org.country || '',
      zip_code: org.zip_code || '',
    });

    // Reset country/state/city selections first
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);

    setSelectedOrganization(org);
    setIsEditMode(true);
    setIsFormOpen(true);
    // Country/state/city will be loaded by useEffect when countries are available
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      is_active: true,
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: '',
      zip_code: '',
    });
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setSelectedOrganization(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedOrganization(null);
    setFormData({
      name: '',
      is_active: true,
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: '',
      zip_code: '',
    });
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setIsEditMode(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await dispatch(deleteOrganization(id)).unwrap();
        showToast('Organization deleted successfully', 'success');
        // Refresh the list
        await handleRefresh();
        setSelectedItems((prev) => prev.filter((item) => item !== id));
      } catch (error) {
        console.error('Failed to delete organization:', error);
        showToast('Failed to delete organization', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      showToast('Please select at least one organization to delete', 'warning');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} organization(s)?`,
      )
    ) {
      try {
        // Delete all selected organizations
        await Promise.all(
          selectedItems.map((id) => dispatch(deleteOrganization(id)).unwrap()),
        );
        showToast(
          `${selectedItems.length} organization(s) deleted successfully`,
          'success',
        );
        // Refresh the list
        await handleRefresh();
        setSelectedItems([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Failed to delete organizations:', error);
        showToast('Failed to delete some organizations', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        is_active: formData.is_active,
        address_line1: formData.address_line1.trim() || undefined,
        address_line2: formData.address_line2.trim() || undefined,
        country: selectedCountry?.name || formData.country || undefined,
        state: selectedState?.name || formData.state || undefined,
        city: selectedCity?.name || formData.city || undefined,
        zip_code: formData.zip_code.trim() || undefined,
      };

      if (isEditMode && selectedOrganization) {
        await dispatch(
          updateOrganization({
            id: selectedOrganization.id,
            payload: submitData,
          }),
        ).unwrap();
        showToast('Organization updated successfully', 'success');
      } else {
        await dispatch(createOrganization({ payload: submitData })).unwrap();
        showToast('Organization created successfully', 'success');
      }
      // Reset form and close
      handleCloseForm();
      // Refresh the list
      await handleRefresh();
    } catch (error) {
      console.error('Failed to save organization:', error);
      showToast('Failed to save organization', 'error');
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(
      selectAll ? [] : filteredOrganizations.map((org) => org.id),
    );
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
    setCurrentPage(1);
    // Reset search when changing tabs
    setSearchInput('');
    setSearchTerm('');
  };

  if (!(roleId === 1)) {
    return (
      <MainLayout role={role}>
        <div className="space-y-4">
          <div className="px-4 py-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Only admins can manage organizations.
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
            Organizations
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Manage organizations and their settings.
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
                placeholder="Search organizations..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 w-80 dark:bg-slate-800 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
              className="dark:border-gray-600 dark:text-gray-300"
              title="Refresh data"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button
              onClick={handleAddNew}
              className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          </div>
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
                    ORGANIZATION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CITY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    STATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    COUNTRY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    STATUS
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
                      className="px-4 py-8 text-gray-500 dark:text-gray-400 text-center"
                      colSpan={7}
                    >
                      Loading organizations...
                    </td>
                  </tr>
                ) : filteredOrganizations.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-gray-500 dark:text-gray-400 text-center"
                      colSpan={7}
                    >
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizations.map((org, index) => (
                    <tr
                      key={org.id || `org-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(org.id)}
                          onChange={() => handleSelectItem(org.id)}
                          className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-gray-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {org.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {org.city || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {org.state || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {org.country || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (org.is_active ??
                            org.status?.toLowerCase() === 'active')
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {(org.is_active ??
                          org.status?.toLowerCase() === 'active')
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(org)}
                            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(org)}
                            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
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
            Showing {pageSize && total ? (currentPage - 1) * pageSize + 1 : 0}{' '}
            to{' '}
            {pageSize && total
              ? Math.min(currentPage * pageSize, total || 0)
              : 0}{' '}
            of {total || 0} organizations.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages || 1, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={
                    currentPage === pageNum
                      ? 'bg-[#4F39F6] hover:bg-[#3D2DC4] text-white'
                      : 'dark:border-gray-600 dark:text-gray-300'
                  }
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              disabled={currentPage >= (totalPages || 1)}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Organization Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Organization Details</DialogTitle>
            </DialogHeader>
            {selectedOrganization ? (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Organization ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.city &&
                      selectedOrganization.city.trim() !== ''
                        ? selectedOrganization.city
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      State
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.state &&
                      selectedOrganization.state.trim() !== ''
                        ? selectedOrganization.state
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.country &&
                      selectedOrganization.country.trim() !== ''
                        ? selectedOrganization.country
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Zip Code
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.zip_code &&
                      selectedOrganization.zip_code.trim() !== ''
                        ? selectedOrganization.zip_code
                        : '—'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address Line 1
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.address_line1 &&
                      selectedOrganization.address_line1.trim() !== ''
                        ? selectedOrganization.address_line1
                        : '—'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address Line 2
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedOrganization.address_line2 &&
                      selectedOrganization.address_line2.trim() !== ''
                        ? selectedOrganization.address_line2
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          (selectedOrganization.is_active ??
                          selectedOrganization.status?.toLowerCase() ===
                            'active')
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {(selectedOrganization.is_active ??
                        selectedOrganization.status?.toLowerCase() === 'active')
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                No organization data available
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Organization Form Dialog */}
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              handleCloseForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Edit Organization' : 'Add New Organization'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full dark:bg-slate-700 dark:text-gray-100"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <Combobox
                    options={countries.map((country) => ({
                      value: country.id.toString(),
                      label: country.name,
                    }))}
                    value={selectedCountry?.id?.toString()}
                    onValueChange={(value) => {
                      const country = countries.find(
                        (c) => c.id.toString() === value,
                      );
                      setSelectedCountry(country || null);
                      setSelectedState(null);
                      setSelectedCity(null);
                      setFormData({
                        ...formData,
                        country: country?.name || '',
                        state: '',
                        city: '',
                      });
                    }}
                    placeholder={
                      loadingCountries ? 'Loading...' : 'Select Country'
                    }
                    searchPlaceholder="Search countries..."
                    emptyMessage="No countries found"
                    loading={loadingCountries}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State
                  </label>
                  <Combobox
                    options={states.map((state) => ({
                      value: state.id.toString(),
                      label: state.name,
                    }))}
                    value={selectedState?.id?.toString()}
                    onValueChange={(value) => {
                      const state = states.find(
                        (s) => s.id.toString() === value,
                      );
                      setSelectedState(state || null);
                      setSelectedCity(null);
                      setFormData({
                        ...formData,
                        state: state?.name || '',
                        city: '',
                      });
                    }}
                    placeholder={
                      loadingStates
                        ? 'Loading...'
                        : !selectedCountry
                          ? 'Select Country first'
                          : 'Select State'
                    }
                    searchPlaceholder="Search states..."
                    emptyMessage={
                      selectedCountry
                        ? 'No states found'
                        : 'Select a country first'
                    }
                    disabled={!selectedCountry}
                    loading={loadingStates}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <Combobox
                    options={cities.map((city) => ({
                      value: city.id.toString(),
                      label: city.name,
                    }))}
                    value={selectedCity?.id?.toString()}
                    onValueChange={(value) => {
                      const city = cities.find(
                        (c) => c.id.toString() === value,
                      );
                      setSelectedCity(city || null);
                      setFormData({
                        ...formData,
                        city: city?.name || '',
                      });
                    }}
                    placeholder={
                      loadingCities
                        ? 'Loading...'
                        : !selectedState
                          ? 'Select State first'
                          : 'Select City'
                    }
                    searchPlaceholder="Search cities..."
                    emptyMessage={
                      selectedState ? 'No cities found' : 'Select a state first'
                    }
                    disabled={!selectedState}
                    loading={loadingCities}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address Line 1
                  </label>
                  <Textarea
                    value={formData.address_line1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_line1: e.target.value,
                      })
                    }
                    className="w-full dark:bg-slate-700 dark:text-gray-100"
                    placeholder="Enter address line 1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address Line 2
                  </label>
                  <Textarea
                    value={formData.address_line2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_line2: e.target.value,
                      })
                    }
                    className="w-full dark:bg-slate-700 dark:text-gray-100"
                    placeholder="Enter address line 2"
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zip Code
                  </label>
                  <Input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) =>
                      setFormData({ ...formData, zip_code: e.target.value })
                    }
                    className="w-full dark:bg-slate-700 dark:text-gray-100"
                    placeholder="Enter zip code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_active: checked,
                        })
                      }
                      className="data-[state=checked]:bg-[#4F39F6]"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
                >
                  {isEditMode ? 'Update' : 'Create'} Organization
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default OrganizationsPage;
