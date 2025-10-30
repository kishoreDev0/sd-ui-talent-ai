import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector } from '@/store';
import axiosInstance from '@/axios-setup/axios-instance';

const UsersPage: React.FC = () => {
  const role = useUserRole();
  const { user } = useAppSelector((state) => state.auth);
  const roleId =
    user?.role?.id ??
    user?.role_id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role?.id ??
    JSON.parse(localStorage.getItem('user') || 'null')?.role_id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<any>>([]);

  useEffect(() => {
    const canView = roleId === 1 || roleId === 2;
    if (!canView) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        // Expecting backend endpoint to support pagination. Adjust if needed.
        const res = await axiosInstance.get('/api/v1/users', {
          params: { page: 1, page_size: 20 },
        });
        const data = res.data?.data || res.data;
        const items = data?.items || data || [];
        // TA Executive should not see admin users
        const filtered =
          roleId === 2
            ? items.filter((u: any) => (u.role?.id ?? u.role_id) !== 1)
            : items;
        setUsers(filtered);
      } catch (e: any) {
        setError(
          e?.response?.data?.detail || e?.message || 'Failed to load users',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleId]);

  return (
    <MainLayout role={role}>
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage team members</p>
        </div>

        {!(roleId === 1 || roleId === 2) ? (
          <div className="text-sm text-gray-600">
            Only admins and TA executives can view users.
          </div>
        ) : loading ? (
          <div className="text-sm text-gray-600">Loading users…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-left text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-2 border-b">Name</th>
                  <th className="px-4 py-2 border-b">Email</th>
                  <th className="px-4 py-2 border-b">Role</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Created</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 border-b" colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b">
                        {u.first_name || u.last_name
                          ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                          : u.name || '—'}
                      </td>
                      <td className="px-4 py-3 border-b">{u.email}</td>
                      <td className="px-4 py-3 border-b">
                        {u.role?.name || u.role_name || '—'}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {u.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UsersPage;
