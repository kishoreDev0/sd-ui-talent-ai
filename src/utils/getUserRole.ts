import { useAppSelector } from '@/store';
import { UserRole } from '@/types';

/**
 * Map role_id to UserRole type
 * Role ID mapping:
 * 1 = admin
 * 2 = ta_executive
 * 3 = ta_manager
 * 4 = hiring_manager
 * 5 = interviewer
 * 6 = hr_ops
 */
const getRoleFromId = (roleId: number | undefined): UserRole => {
  switch (roleId) {
    case 1:
      return 'admin';
    case 2:
      return 'ta_executive';
    case 3:
      return 'ta_manager';
    case 4:
      return 'hiring_manager';
    case 5:
      return 'interviewer';
    case 6:
      return 'hr_ops';
    default:
      return 'admin';
  }
};

/**
 * Get the current user's role from Redux store or localStorage
 * Prioritizes role.id over role_id and role.name
 * @returns UserRole - The current user's role
 */
export const getUserRole = (): UserRole => {
  // Try to get from localStorage first (for bypass login)
  const userData = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null;

  // Prioritize role.id over role_id and role name
  if (userData?.role?.id) {
    return getRoleFromId(userData.role.id);
  }

  // Fallback to role_id
  if (userData?.role_id) {
    return getRoleFromId(userData.role_id);
  }

  // Fallback to role name for backward compatibility
  let roleName: string;
  if (userData?.role?.name) {
    roleName = userData.role.name;
  } else if (userData?.role) {
    roleName = userData.role;
  } else {
    return 'admin'; // Default
  }

  // Map role name to UserRole type
  if (roleName === 'admin') return 'admin';
  if (roleName === 'ta_executive') return 'ta_executive';
  if (roleName === 'ta_manager') return 'ta_manager';
  if (roleName === 'hiring_manager') return 'hiring_manager';
  if (roleName === 'interviewer') return 'interviewer';
  if (roleName === 'hr_ops' || roleName === 'hr_op') return 'hr_ops';

  // Default to admin
  return 'admin';
};

/**
 * React hook to get the current user's role
 * Uses Redux store first, falls back to localStorage
 * Prioritizes role.id over role_id and role.name
 */
export const useUserRole = (): UserRole => {
  const { user } = useAppSelector((state) => state.auth);

  // Prioritize role.id from Redux user
  if (user?.role?.id) {
    return getRoleFromId(user.role.id);
  }

  // Fallback to role_id
  if (user?.role_id) {
    return getRoleFromId(user.role_id);
  }

  // Fallback to role name or localStorage
  const userData =
    user ||
    (localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null);

  // Try role.id from localStorage
  if (userData?.role?.id) {
    return getRoleFromId(userData.role.id);
  }

  // Try role_id from localStorage
  if (userData?.role_id) {
    return getRoleFromId(userData.role_id);
  }

  // Fallback to role name
  let roleName: string;
  if (userData?.role?.name) {
    roleName = userData.role.name;
  } else if (userData?.role) {
    roleName = userData.role;
  } else {
    return 'admin'; // Default
  }

  // Map role name to UserRole type
  if (roleName === 'admin') return 'admin';
  if (roleName === 'ta_executive') return 'ta_executive';
  if (roleName === 'ta_manager') return 'ta_manager';
  if (roleName === 'hiring_manager') return 'hiring_manager';
  if (roleName === 'interviewer') return 'interviewer';
  if (roleName === 'hr_ops' || roleName === 'hr_op') return 'hr_ops';

  // Default to admin
  return 'admin';
};
