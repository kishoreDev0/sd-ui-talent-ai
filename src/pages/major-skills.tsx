import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

const MajorSkills: React.FC = () => {
  const role = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const tabs = ['All', 'Active', 'Inactive', 'Recent'];

  const majorSkills = [
    {
      id: 1,
      majorSkill: 'Full Stack Development',
      description:
        'Comprehensive development skills covering both frontend and backend technologies.',
      createdBy: 'admin',
      active: true,
      createdDate: '5 days ago',
      updated: '2 days ago',
    },
    {
      id: 2,
      majorSkill: 'Data Science',
      description:
        'Advanced analytical skills including machine learning, statistics, and data visualization.',
      createdBy: 'admin',
      active: true,
      createdDate: '1 week ago',
      updated: '4 days ago',
    },
    {
      id: 3,
      majorSkill: 'DevOps Engineering',
      description:
        'Skills in deployment, automation, and infrastructure management for modern applications.',
      createdBy: 'admin',
      active: false,
      createdDate: '2 weeks ago',
      updated: '1 week ago',
    },
  ];

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : majorSkills.map((item) => item.id));
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  return (
    <MainLayout role={role}>
      <div className="space-y-4">
        {/* Header */}
        <div className="px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900">Major Skills</h1>
          <p className="text-gray-600 text-sm">
            Manage major skills and their settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab
                    ? 'border-[#4F39F6] text-[#4F39F6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                placeholder="Search major skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          <Button className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Major Skill
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
                    MAJOR SKILL
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPDATED
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {majorSkills.map((majorSkill) => (
                  <tr key={majorSkill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(majorSkill.id)}
                        onChange={() => handleSelectItem(majorSkill.id)}
                        className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {majorSkill.majorSkill}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {majorSkill.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {majorSkill.createdBy}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={majorSkill.active}
                          className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">
                          {majorSkill.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {majorSkill.createdDate}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {majorSkill.updated}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing 1 to 3 of 3 major skills.
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled className="text-gray-400">
              Previous
            </Button>
            <Button className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white">
              1
            </Button>
            <Button variant="outline" disabled className="text-gray-400">
              Next
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MajorSkills;
