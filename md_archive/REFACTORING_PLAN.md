# Role-Based Refactoring Plan

## Current Issues
1. Employer role has access to employee routes (timesheets, leaves, documents) - WRONG
2. Components are not organized by role
3. Sidenav needs modern redesign
4. Routes need proper role separation

## Role-Based Folder Structure

```
features/
├── prospect/
│   ├── profile/
│   └── dashboard/
├── employee/
│   ├── timesheets/
│   ├── leaves/
│   ├── documents/
│   └── dashboard/
├── supervisor/
│   ├── approvals/
│   ├── team/
│   ├── reports/
│   └── dashboard/
├── hr/
│   ├── employees/
│   ├── leaves/
│   ├── documents/
│   └── dashboard/
├── admin/
│   ├── users/
│   ├── roles/
│   ├── settings/
│   └── dashboard/
├── employer/
│   ├── financial/
│   ├── analytics/
│   ├── workforce/
│   └── dashboard/
└── shared/
    └── (shared components)
```

## Role Access Rules

### Prospect
- ✅ Profile viewing/editing
- ❌ Timesheets, Leaves, Documents (except shared)

### Employee  
- ✅ Own timesheets, leaves, documents
- ❌ Approvals, team management

### Supervisor
- ✅ Employee features + 
- ✅ Team approvals, team reports
- ❌ All employee management, system settings

### HR
- ✅ Supervisor features +
- ✅ All employee management, document compliance
- ❌ System settings, user creation

### Admin
- ✅ HR features +
- ✅ User management, system settings
- ❌ Financial reports, analytics

### Employer
- ✅ Admin features +
- ✅ Financial reports, analytics, workforce management
- ❌ Should NOT see employee timesheets/leaves directly (only through reports)

## Implementation Steps
1. Create folder structure
2. Move components to role folders
3. Fix routes - remove employee access from employer
4. Create employer-specific components
5. Redesign sidenav
6. Update navigation logic

