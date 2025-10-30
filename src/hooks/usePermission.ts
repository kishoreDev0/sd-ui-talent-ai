/**
 * React Hook for Permission Checks
 * Provides efficient permission checking with memoization
 */

import { useMemo } from 'react';
import { useAppSelector } from '@/store';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  UserPermissions,
  PermissionType,
} from '@/utils/permissionHelpers';

/**
 * Hook to check if user has a specific permission
 * @param resourceName - Name of the resource (e.g., 'job', 'candidate')
 * @param permissionType - Type of permission ('read', 'create', 'write', 'delete')
 * @returns boolean - True if user has the permission
 */
export const usePermission = (
  resourceName: string,
  permissionType: PermissionType,
): boolean => {
  const { userPermissions } = useAppSelector((state) => state.permissions);

  return useMemo(() => {
    return hasPermission(userPermissions, resourceName, permissionType);
  }, [userPermissions, resourceName, permissionType]);
};

/**
 * Hook to check if user has any permission on a resource
 * @param resourceName - Name of the resource
 * @returns boolean - True if user has any permission
 */
export const useHasAnyPermission = (resourceName: string): boolean => {
  const { userPermissions } = useAppSelector((state) => state.permissions);

  return useMemo(() => {
    return hasAnyPermission(userPermissions, resourceName);
  }, [userPermissions, resourceName]);
};

/**
 * Hook to check if user has all specified permissions
 * @param resourceName - Name of the resource
 * @param permissions - Array of permission types required
 * @returns boolean - True if user has all permissions
 */
export const useHasAllPermissions = (
  resourceName: string,
  permissions: PermissionType[],
): boolean => {
  const { userPermissions } = useAppSelector((state) => state.permissions);

  return useMemo(() => {
    return hasAllPermissions(userPermissions, resourceName, permissions);
  }, [userPermissions, resourceName, permissions]);
};

/**
 * Hook to get all permissions for a specific resource
 * @param resourceName - Name of the resource
 * @returns ResourcePermission object or null
 */
export const useResourcePermissions = (resourceName: string) => {
  const { userPermissions } = useAppSelector((state) => state.permissions);

  return useMemo(() => {
    if (!userPermissions) return null;
    return userPermissions.permissions[resourceName] || null;
  }, [userPermissions, resourceName]);
};

/**
 * Hook to get all user permissions
 * @returns UserPermissions object or null
 */
export const useUserPermissions = (): UserPermissions | null => {
  const { userPermissions } = useAppSelector((state) => state.permissions);
  return userPermissions;
};

/**
 * Hook to check multiple permissions at once
 * @param checks - Array of permission checks
 * @returns Object with permission check results
 */
export const useMultiplePermissions = (
  checks: Array<{ resource: string; permission: PermissionType }>,
) => {
  const { userPermissions } = useAppSelector((state) => state.permissions);

  return useMemo(() => {
    const results: Record<string, boolean> = {};

    checks.forEach((check) => {
      const key = `${check.resource}.${check.permission}`;
      results[key] = hasPermission(
        userPermissions,
        check.resource,
        check.permission,
      );
    });

    return results;
  }, [userPermissions, checks]);
};
