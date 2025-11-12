import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

const Skills: React.FC = () => {
  const role = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const tabs = ['All', 'Active', 'Inactive', 'Recent'];

  const skills = [
    {
      id: 1,
      skill: 'JavaScript',
      description:
        'JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.',
      createdBy: 'admin',
      active: true,
      createdDate: '2 days ago',
      updated: '1 day ago',
    },
    {
      id: 2,
      skill: 'React',
      description:
        'React is a JavaScript library for building user interfaces, particularly web applications.',
      createdBy: 'admin',
      active: true,
      createdDate: '3 days ago',
      updated: '2 days ago',
    },
  ];

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : skills.map((item) => item.id));
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
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-600 text-sm">
            Manage skills and their settings.
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
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          <Button className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
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
                    SKILL
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(skill.id)}
                        onChange={() => handleSelectItem(skill.id)}
                        className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {skill.skill}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {skill.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {skill.createdBy}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={skill.active}
                          className="h-4 w-4 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">
                          {skill.active ? 'Active' : 'Inactive'}
                        </span>
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
            Showing 1 to 2 of 2 skills.
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

export default Skills;
