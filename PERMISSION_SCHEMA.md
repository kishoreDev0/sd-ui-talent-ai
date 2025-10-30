# Permission Schema Documentation

## Overview

This document describes the permission system schema optimized for efficient rendering and permission checks in the frontend.

## Database Schema Structure

### 1. Roles Table

```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,           -- e.g., 'admin', 'ta_executive'
    display_name VARCHAR(100) NOT NULL,          -- e.g., 'Admin', 'TA Executive'
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes:**

- `name` - For role lookups
- `active` - For filtering active roles

### 2. Resources Table

```sql
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,           -- e.g., 'job', 'candidate'
    display_name VARCHAR(200) NOT NULL,          -- e.g., 'Job Management'
    description TEXT,
    module VARCHAR(50) NOT NULL,                 -- e.g., 'recruitment', 'administration'
    api_endpoint VARCHAR(255),                  -- e.g., '/api/jobs'
    frontend_route VARCHAR(255),                -- e.g., '/jobs'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes:**

- `name` - For resource lookups
- `module` - For grouping by module
- `is_active` - For filtering active resources

### 3. Permissions Table

```sql
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    can_read BOOLEAN DEFAULT FALSE NOT NULL,
    can_create BOOLEAN DEFAULT FALSE NOT NULL,
    can_write BOOLEAN DEFAULT FALSE NOT NULL,
    can_delete BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_name) REFERENCES resources(name) ON DELETE CASCADE,
    UNIQUE KEY unique_role_resource (role_id, resource_name)
);
```

**Indexes (Critical for Performance):**

- `(role_id, resource_name)` - Composite index for fast permission lookups
- `role_id` - For role-based queries
- `resource_name` - For resource-based queries

**Optimization:** The composite index `(role_id, resource_name)` is the most important index as it supports the most common query pattern: "What permissions does role X have on resource Y?"

## Frontend Data Structures

### 1. Permission Matrix (Optimized for Lookups)

```typescript
type PermissionMatrix = Record<number, Record<string, Permission>>;

// Structure:
// {
//   1: {  // role_id: 1 (admin)
//     'job': { can_read: true, can_create: true, ... },
//     'candidate': { can_read: true, ... },
//     ...
//   },
//   2: {  // role_id: 2 (ta_executive)
//     'job': { can_read: true, can_create: true, ... },
//     ...
//   }
// }
```

**Benefits:**

- O(1) lookup: `matrix[roleId][resourceName]`
- Fast iteration for rendering UI
- Memory efficient for multiple roles

### 2. User Permissions (Flattened Structure)

```typescript
interface UserPermissions {
  user_id: number;
  role_id: number;
  role_name: string;
  permissions: Record<string, ResourcePermission>;

  // Helper methods for efficient checks
  hasAccess: (resourceName: string) => boolean;
  canRead: (resourceName: string) => boolean;
  canCreate: (resourceName: string) => boolean;
  canWrite: (resourceName: string) => boolean;
  canDelete: (resourceName: string) => boolean;
}
```

**Structure:**

```typescript
{
  user_id: 1,
  role_id: 2,
  role_name: 'ta_executive',
  permissions: {
    'job': {
      resource_name: 'job',
      resource_display_name: 'Job Management',
      module: 'recruitment',
      can_read: true,
      can_create: true,
      can_write: true,
      can_delete: true
    },
    'candidate': { ... },
    ...
  }
}
```

**Benefits:**

- Single object for all user permissions
- Fast permission checks: `userPermissions.canRead('job')`
- No need to query multiple times per render

### 3. Resource Permission (For UI Rendering)

```typescript
interface ResourcePermission {
  resource_name: string;
  resource_display_name: string;
  module: string;
  frontend_route?: string;
  can_read: boolean;
  can_create: boolean;
  can_write: boolean;
  can_delete: boolean;
}
```

## API Response Formats

### Get User Permissions

```typescript
// GET /api/permissions/user/:userId
Response: {
  status: 'success',
  data: {
    user_id: 1,
    role_id: 2,
    role_name: 'ta_executive',
    permissions: {
      'job': { ... },
      'candidate': { ... },
      ...
    }
  }
}
```

### Get All Permissions (Admin UI)

```typescript
// GET /api/permissions
Response: {
  status: 'success',
  data: {
    roles: [...],
    resources: [...],
    permissions: [...]
  }
}
```

### Get Permissions for Role (Admin UI)

```typescript
// GET /api/permissions/role/:roleId
Response: {
  status: 'success',
  data: {
    role_id: 2,
    role_name: 'ta_executive',
    role_display_name: 'TA Executive',
    permissions: [
      {
        resource_name: 'job',
        resource_display_name: 'Job Management',
        module: 'recruitment',
        can_read: true,
        can_create: true,
        can_write: true,
        can_delete: true
      },
      ...
    ]
  }
}
```

## Rendering Optimization Strategies

### 1. Load Permissions Once on Login

- Fetch all user permissions after authentication
- Store in Redux store
- Use for all permission checks during session

### 2. Use Permission Matrix for Admin UI

- Load all permissions once when admin opens permission page
- Build permission matrix for fast lookups
- No additional API calls when toggling permissions

### 3. Memoize Permission Checks

```typescript
// Use React.useMemo for expensive permission calculations
const canEdit = useMemo(() => {
  return hasPermission(userPermissions, 'job', 'write');
}, [userPermissions]);
```

### 4. Group by Module for UI

```typescript
// Group permissions by module for sidebar/menu rendering
const grouped = groupPermissionsByModule(permissions);
// {
//   'recruitment': [perm1, perm2, ...],
//   'administration': [perm3, perm4, ...]
// }
```

## Performance Considerations

### Frontend Optimizations:

1. **Single Permission Object**: Store all user permissions in one object
2. **Lazy Loading**: Only load permissions when needed (not on every page)
3. **Caching**: Cache permission checks in component state/memo
4. **Indexed Lookups**: Use object keys for O(1) permission checks

### Database Optimizations:

1. **Composite Index**: `(role_id, resource_name)` for fast permission queries
2. **Foreign Keys**: Ensure data integrity and efficient JOINs
3. **Selective Loading**: Only load active roles and resources
4. **Views**: Use database views for common query patterns

## Usage Examples

### 1. Check Permission in Component

```typescript
import { useAppSelector } from '@/store';
import { hasPermission } from '@/utils/permissionHelpers';

const MyComponent = () => {
  const { userPermissions } = useAppSelector(state => state.permissions);

  const canCreateJob = hasPermission(userPermissions, 'job', 'create');
  const canEditJob = hasPermission(userPermissions, 'job', 'write');

  return (
    <>
      {canCreateJob && <Button>Create Job</Button>}
      {canEditJob && <Button>Edit Job</Button>}
    </>
  );
};
```

### 2. Permission Gate Component

```typescript
import { PermissionGate } from '@/components/PermissionGate';

<PermissionGate resource="job" permission="create">
  <CreateJobButton />
</PermissionGate>
```

### 3. Render Sidebar Based on Permissions

```typescript
const accessibleResources = getAccessibleResources(
  userPermissions,
  allResources
);

return (
  <Sidebar>
    {accessibleResources.map(resource => (
      <NavItem key={resource.resource_name} to={resource.frontend_route}>
        {resource.resource_display_name}
      </NavItem>
    ))}
  </Sidebar>
);
```

### 4. Admin Permission Matrix UI

```typescript
const PermissionMatrix = () => {
  const { permissionMatrix, roles, resources } = useAppSelector(
    state => state.permissions
  );

  return (
    <Table>
      {roles.map(role => (
        <tr key={role.id}>
          <td>{role.display_name}</td>
          {resources.map(resource => {
            const perm = permissionMatrix[role.id]?.[resource.name];
            return (
              <td key={resource.name}>
                <PermissionToggle
                  permission={perm}
                  onChange={(newPerm) => updatePermission(role.id, resource.name, newPerm)}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </Table>
  );
};
```

## Default Permissions

### Admin

- All resources: Read, Create, Write, Delete

### TA Executive

- Job Management resources: Read, Create, Write, Delete
- Other recruitment resources: Read, Create, Write, Delete
- Administration resources: Read only

### TA Manager

- Most resources: Read only
- Analytics: Read

### Hiring Manager

- Jobs: Read
- Candidates: Read, Write
- Interviews: Read, Write, Create
- Analytics: Read

### Interviewer

- Candidates: Read
- Interviews: Read, Write
- Analytics: Read

### HR Operations

- Jobs: Read, Write
- Candidates: Read, Write
- Interviews: Read
- Analytics: Read
- Offers: Read, Write, Create
- Onboarding: Read, Write, Create

## Migration Strategy

1. **Initial Setup**: Create tables with indexes
2. **Seed Data**: Insert default roles, resources, and permissions
3. **Migration Script**: Ensure all existing users have role assignments
4. **Backward Compatibility**: Default permissions for roles without explicit assignments

## Best Practices

1. **Always Check Permissions Client-Side AND Server-Side**
2. **Cache Permission Checks**: Don't recalculate on every render
3. **Fail Gracefully**: Hide UI elements instead of showing errors
4. **Group by Module**: Organize permissions by functional area
5. **Use Type Safety**: Leverage TypeScript for permission checks
6. **Optimize Queries**: Use indexes and composite indexes effectively
