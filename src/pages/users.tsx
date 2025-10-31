import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useAppSelector } from '@/store';
import axiosInstance from '@/axios-setup/axios-instance';
import { USERS } from '@/store/endpoints';

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
  interface UserRow {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    role?: { id?: number; name?: string };
    role_id?: number;
    role_name?: string;
    is_active?: boolean;
    created_at?: string;
    name?: string;
  }
  const [users, setUsers] = useState<UserRow[]>([]);

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
        const res = await axiosInstance.get(USERS.LIST, {
          params: { page: 1, page_size: 20 },
        });
        const data = res.data?.data || res.data;
        const items: UserRow[] = (data?.items || data || []) as UserRow[];
        // TA Executive should not see admin users
        const filtered =
          roleId === 2
            ? items.filter((u) => (u.role?.id ?? u.role_id) !== 1)
            : items;
        setUsers(filtered);
      } catch (e: unknown) {
        const err = e as {
          response?: { data?: { detail?: string } };
          message?: string;
        };
        setError(
          err?.response?.data?.detail || err?.message || 'Failed to load users',
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage team members</p>
        </div>

        {!(roleId === 1 || roleId === 2) ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Only admins and TA executives can view users.
          </div>
        ) : loading ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">Loading users…</div>
        ) : error ? (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
              <thead className="bg-gray-50 dark:bg-slate-900 text-left text-sm text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Name</th>
                  <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Email</th>
                  <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Role</th>
                  <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Status</th>
                  <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="text-sm bg-white dark:bg-slate-800">
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-center" colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                        {u.first_name || u.last_name
                          ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                          : u.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">{u.email}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                        {u.role?.name || u.role_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                        {u.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
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
