# Authentication Bypassed

## ✅ Authentication is currently bypassed for demo purposes

The platform is now accessible without login. Simply run:

```bash
npm run dev
```

Then visit: **http://localhost:5173**

You'll be automatically redirected to the dashboard as a Demo User with **Admin** role.

## 🔄 To Change User Role

Edit `src/axios-setup/private-route.tsx` line 25:

```typescript
role: 'admin', // Change to: 'admin', 'hiring_manager', 'interviewer', 'ta_team'
```

## 🔒 To Re-enable Authentication

Change `BYPASS_AUTH` to `false` in `src/axios-setup/private-route.tsx` line 11:

```typescript
const BYPASS_AUTH = false;
```

## 🎯 Available Roles

- `admin` - Full access to all features
- `hiring_manager` - Can create jobs and manage candidates
- `interviewer` - Can view scheduled interviews and submit feedback
- `ta_team` - Can manage candidate pipeline and view analytics
