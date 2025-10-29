# Role Bypass Feature - Quick Access Buttons

## Overview

Added 5 role buttons on the login page that bypass authentication and provide instant access to different dashboards.

## Roles Available

1. **Admin** - Full system control and management
2. **TA Team** - Resume validation, sourcing, and pipeline
3. **Hiring Manager** - Review candidates and manage jobs
4. **Interviewer** - Conduct interviews and provide feedback
5. **HR Operations** - Offers, onboarding, and documentation

## How to Use

1. Navigate to the login page
2. You'll see 5 colorful role buttons at the top
3. Click any button to instantly access that role's dashboard
4. No credentials needed - perfect for testing and demos!

## Files Modified

- `src/components/login/role-bypass.tsx` - New component with role buttons
- `src/components/login/index.tsx` - Added role bypass section
- `src/pages/dashboard/dashboard-router.tsx` - Added HR Ops dashboard route
- `src/pages/dashboard/hr-ops-dashboard.tsx` - New HR Ops dashboard
- `src/components/layout/sidebar.tsx` - Updated to support hr_ops role
- `src/types/user.ts` - Added hr_ops to UserRole type

## Features

- **Instant Access**: Click any button and you're in
- **Mock Authentication**: Sets localStorage with role data
- **Beautiful Design**: Color-coded buttons with gradients
- **Role-Specific Dashboards**: Each button shows appropriate dashboard
- **No Backend Required**: Pure frontend feature for demo purposes
