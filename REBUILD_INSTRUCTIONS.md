# Employee Portal - Functional Requirements & Features

## 📋 Application Overview

A **multi-tenant** employee management portal that helps organizations manage their workforce, track time and attendance, handle leave requests, store documents securely, and generate reports. Each organization (tenant) has complete data isolation.

This portal serves two distinct user groups:
- **Employee Roles** (Prospect, Employee) - Submit timesheets, request leaves, upload documents
- **Employer Roles** (Supervisor, HR, Admin, Employer) - Review, approve/reject submissions, manage users, view analytics

---

## 🛠️ Required Tech Stack

- **Frontend**: Angular 18+ (TypeScript only)
- **Backend**: Node.js + Express.js (TypeScript only)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh tokens
- **Email**: Any email service (Nodemailer recommended)
- **Styling**: SCSS with CSS variables for multi-theme support

---

## 🎯 50 Core Features & Requirements

### 👥 USER MANAGEMENT (1-8)

1. **User Registration** - Allow new users to sign up with email, password, name, and basic details
2. **User Login** - Authenticate users with email and password, issue secure session tokens
3. **Password Reset** - Users can request password reset via email with OTP/link verification
4. **User Profiles** - Users can view and edit their profile: contact info, address, avatar, date of birth
5. **Employee Information** - Store employee ID, department, designation, joining date, employment type, salary
6. **Visa Tracking** - Track visa type, number, expiry date, and status for employees
7. **User Roles** - Support 6 roles: Prospect, Employee, Supervisor, HR, Admin, Employer (hierarchical permissions)
8. **Role-Based Access** - Different users see different features based on their role

### ⏰ TIMESHEET MANAGEMENT (9-16)

9. **Time Entry** - Employees can log hours worked per day with project, date, hours, and description
10. **Weekly View** - Display Mon-Sun calendar grid showing all time entries for the current week
11. **Quick Entry** - Allow entering hours for all 7 days at once for a single project (batch save)
12. **Billable Hours** - Mark entries as billable or non-billable
13. **Timesheet Status** - Track status: Draft → Submitted → Approved/Rejected
14. **Submit Timesheet** - Employees submit entire week for approval (locks editing)
15. **Edit/Delete Entries** - Allow editing/deleting only Draft or Rejected entries
16. **Week Navigation** - Browse previous/next weeks, jump to specific week, return to current week

### 🌴 LEAVE MANAGEMENT (17-24)

17. **Leave Request** - Employees request leave with type, start date, end date, reason
18. **Leave Types** - Support multiple types: Annual, Sick, Personal, Unpaid, Maternity/Paternity
19. **Leave Balance** - Display available days per leave type, used days, remaining balance
20. **Half-Day Leaves** - Option to request half-day (morning or afternoon)
21. **Leave Status** - Track status: Pending → Approved/Rejected
22. **Leave Calendar** - Visual calendar showing all leaves (approved, pending, rejected)
23. **Leave History** - View all past leave requests with dates, types, status
24. **Leave Notifications** - Email notifications when leave is approved/rejected

### 📄 DOCUMENT MANAGEMENT (25-32)

25. **Document Upload** - Users can upload documents (PDF, images, Word, Excel) with file size limits
26. **Document Categories** - Organize by category: Visa, Passport, Contract, Certification, Tax, Insurance, Other
27. **Document Metadata** - Store filename, category, upload date, expiry date (if applicable)
28. **Expiry Alerts** - Notify users when documents are expiring soon (30/15/7 days before)
29. **Document Access** - Users can view/download their own documents; admins see all
30. **Document Sharing** - Share specific documents with other users (HR, supervisors)
31. **Document Security** - Secure file storage, access control, virus scanning recommended
32. **Document Deletion** - Users can delete their uploaded documents

### ✅ APPROVAL WORKFLOWS (33-38)

33. **Timesheet Approvals** - Supervisors see all pending timesheets from their team
34. **Approve/Reject Timesheets** - Supervisors can approve or reject with optional comments
35. **Bulk Approval** - Approve multiple timesheets at once
36. **Leave Approvals** - Supervisors/HR approve or reject leave requests
37. **Approval Filters** - Filter by employee, date range, status (pending/approved/rejected)
38. **Approval Notifications** - Employees get notified when their submissions are reviewed

### 📊 DASHBOARD & ANALYTICS (39-44)

39. **Employee Dashboard** - Show personal stats: hours this week, pending leaves, upcoming deadlines
40. **Supervisor Dashboard** - Show pending approvals count, team hours summary, recent activity
41. **Quick Actions** - Shortcut buttons: Submit Timesheet, Request Leave, Upload Document
42. **Recent Activity** - Timeline of recent actions (timesheet submitted, leave approved, document uploaded)
43. **Weekly Summary** - Total hours worked, breakdown by project, billable vs non-billable
44. **Charts & Graphs** - Visual representation of hours worked, leave balance, team productivity

### 📈 REPORTING (45-48)

45. **Timesheet Reports** - Generate reports filtered by employee, date range, project, status
46. **Leave Reports** - Summary of leave usage by employee, department, leave type
47. **Team Reports** - Supervisors view team productivity, total hours, project allocation
48. **Export Reports** - Download reports as PDF or Excel

### 🔔 NOTIFICATIONS & ALERTS (49-50)

49. **Email Notifications** - Send emails for: timesheet approved, leave status changed, document expiring, password reset
50. **In-App Notifications** - Bell icon with notification count, list of recent notifications, mark as read

---

## 🔐 Critical Requirements

### Multi-Tenancy
- Each organization is a separate **tenant** with isolated data
- Users belong to one tenant and can only see their organization's data
- Tenant ID is required in all database queries and API requests

### Role Hierarchy (Low → High)

#### Employee Roles (Submit Data)
1. **Prospect** - Limited access
   - Can only view and edit their own profile
   - Cannot submit timesheets or leave requests
   - Read-only access to documents shared with them
   - **Dashboard**: Basic profile completion status

2. **Employee** - Standard workforce member
   - Submit daily/weekly timesheets
   - Request leave (view balance, submit requests)
   - Upload and manage personal documents
   - View their own approval history
   - **Dashboard**: Personal stats (hours worked, pending leaves, upcoming tasks)

#### Employer Roles (Review & Approve)

3. **Supervisor** - Team lead/manager
   - All Employee permissions +
   - **Approve/Reject** team member timesheets
   - **Approve/Reject** team member leave requests
   - View team reports and productivity metrics
   - Access team member documents (if shared)
   - **Dashboard**: Pending approvals count, team summary, recent team activity

4. **HR** - Human Resources
   - All Supervisor permissions +
   - **Approve/Reject** all leave requests across organization
   - Manage leave policies and balances
   - Access **all employee documents** (visa, passport, contracts)
   - Receive alerts for expiring documents
   - Manage employee onboarding/offboarding
   - **Dashboard**: Organization-wide leave summary, document expiry alerts, HR tasks

5. **Admin** - System Administrator
   - All HR permissions +
   - **Create/Edit/Delete** user accounts
   - Assign roles to users
   - Configure system settings
   - Manage departments and projects
   - **Dashboard**: User management summary, system health, recent changes

6. **Employer** - Organization Owner
   - All Admin permissions +
   - Full access to analytics and reports
   - Financial reports and billable hours tracking
   - Organization-wide settings and branding
   - **Dashboard**: Executive summary, revenue metrics, organization analytics

### Key Permission Differences

| Feature | Prospect | Employee | Supervisor | HR | Admin | Employer |
|---------|----------|----------|------------|-----|-------|----------|
| Submit Timesheet | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve Timesheet | ❌ | ❌ | ✅ (Team) | ✅ (All) | ✅ (All) | ✅ (All) |
| Request Leave | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve Leave | ❌ | ❌ | ✅ (Team) | ✅ (All) | ✅ (All) | ✅ (All) |
| Upload Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Documents | ❌ | ❌ (Own) | ❌ (Shared) | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ❌ (Own) | ✅ (Team) | ✅ (Org) | ✅ (Org) | ✅ (Full) |

### Dashboard Components by Role

#### Employee Dashboard Components
- **Stats Cards**: Hours this week, pending timesheets, leave balance, upcoming deadlines
- **Quick Actions**: Submit Timesheet, Request Leave, Upload Document
- **Recent Activity**: My submissions and their status
- **Alerts**: Pending timesheet submission, document expiry warnings

#### Supervisor Dashboard Components
- **Stats Cards**: Pending approvals, team hours summary, team on leave today
- **Quick Actions**: Review Timesheets, Review Leaves, View Team Report
- **Approval Queue**: List of pending timesheet/leave approvals
- **Team Activity**: Recent team submissions and actions
- **Team Calendar**: Visual view of team availability

#### HR Dashboard Components
- **Stats Cards**: Total employees, pending leaves, expiring documents, new joiners
- **Quick Actions**: Manage Leaves, Review Documents, Employee Directory
- **Document Alerts**: Documents expiring in next 30 days
- **Leave Summary**: Organization-wide leave usage by type
- **Compliance**: Visa/permit expiry tracking

#### Admin Dashboard Components
- **Stats Cards**: Total users, active sessions, system health, recent changes
- **Quick Actions**: Add User, Manage Roles, System Settings
- **User Management**: Recent user additions/changes
- **Activity Log**: System-wide recent actions
- **Department Summary**: Breakdown by department

#### Employer Dashboard Components
- **Stats Cards**: Total billable hours, revenue metrics, team utilization, active projects
- **Quick Actions**: View Reports, Analytics, Settings
- **Financial Charts**: Revenue trends, billable vs non-billable hours
- **Organization Analytics**: Productivity metrics, cost analysis
- **Executive Summary**: High-level overview of all operations

### Security
- Passwords must be encrypted (bcrypt/argon2)
- JWT tokens for authentication with refresh tokens
- Session management for persistent login
- Rate limiting on login/API endpoints
- File upload validation (type, size, malware check)

### User Experience
- Responsive design (mobile, tablet, desktop)
- Dark mode and light mode support
- Fast loading times (lazy load modules)
- Intuitive navigation with breadcrumbs
- Clear error messages and validation feedback
- Accessibility (ARIA labels, keyboard navigation)

---

## 📐 Technical Guidelines

### TypeScript Everywhere
- **100% TypeScript** - No JavaScript files allowed in source code
- All backend and frontend code must use strict TypeScript
- Define proper interfaces and types for all data models
- Use type safety for API requests and responses

### Testing
- **Skip test cases** - Focus on functional implementation only
- No need to write unit tests, integration tests, or e2e tests
- Testing can be added later if needed

### Database Models (Mongoose)
Create Mongoose models with TypeScript interfaces for:
- **User** - tenantId, email, password, role, firstName, lastName, employeeInfo, visaInfo
- **Tenant** - name, domain, settings, branding, isActive
- **Timesheet** - tenantId, userId, date, projectId, hours, description, billable, status
- **Leave** - tenantId, userId, leaveType, startDate, endDate, halfDay, reason, status
- **Document** - tenantId, userId, filename, category, uploadDate, expiryDate, url
- **Notification** - tenantId, userId, type, title, message, read, createdAt
- **Project** - tenantId, name, code, isActive

### Utility Files (Reusable Code)
Create utility modules to avoid duplication:
- **DateUtil** - Date formatting, week ranges, date validation, timezone handling
- **ValidationUtil** - Email validation, password strength, phone validation
- **CryptoUtil** - Password hashing, token generation, encryption helpers
- **EmailUtil** - Email templates, send functions, OTP generation
- **FileUtil** - File validation, upload helpers, file type checking
- **ResponseUtil** - Standardized API responses, error formatting
- **PermissionUtil** - Role checking, permission validation

### SCSS Framework & Theming
- **Token-based architecture** - Define all colors, spacing, typography as CSS variables
- **Multi-theme support** - Minimum 2 themes (Light & Dark), expandable to Corporate/Custom themes
- **Theme switching** - Users can toggle themes, preference saved to database
- **Global variables** - `styles/tokens/tokens.scss` with all design tokens
- **Mixins** - Reusable SCSS mixins for flex, grid, cards, buttons
- **Responsive utilities** - Breakpoint mixins for mobile, tablet, desktop

#### Critical Color Rules
- **ZERO hardcoded colors in components** - No hex codes (#fff, #000), no RGB/RGBA values
- **ALL colors MUST be CSS variables** - Use var(--primary-500), var(--text-primary), etc.
- **Define ALL colors in global files only** - styles/tokens/tokens.scss and theme files
- **Components reference only** - Components should only reference CSS variables, never define colors
- **Theme files control colors** - Each theme (light.scss, dark.scss) defines its own color values
- **Example**: ❌ `color: #3b82f6` | ✅ `color: var(--primary-500)`
- **Example**: ❌ `background: rgba(0,0,0,0.1)` | ✅ `background: var(--surface-overlay)`

#### Adding New Themes
To add a new theme (e.g., Corporate, High Contrast, Custom Brand):
1. Create a new theme file with same variable names as existing themes
2. Apply theme via `[data-theme]` attribute on root element
3. Import the theme file in main styles.scss
4. **NO component changes needed** - All components automatically use the new colors

---

## 📱 User Workflows

### Employee Daily Flow
1. **Login** → Redirected to Employee Dashboard
2. **Dashboard** → View personal stats (hours this week, leave balance, pending tasks)
3. **Timesheets** → Enter hours for today → Save as draft
4. **Friday** → Review full week → Submit timesheet for approval
5. **Leaves** → Request leave when needed → Monitor approval status
6. **Documents** → Upload required documents → Check expiry dates
7. **Notifications** → Check approval status of submissions

### Supervisor Daily Flow
1. **Login** → Redirected to Supervisor Dashboard
2. **Dashboard** → View pending approvals count, team summary
3. **Approvals** → Review pending timesheets from team members
4. **Action** → Approve/reject timesheets with optional comments
5. **Approvals** → Review pending leave requests
6. **Reports** → Check team productivity and hours breakdown
7. **Team** → Monitor team availability and workload

### HR Daily Flow
1. **Login** → Redirected to HR Dashboard
2. **Dashboard** → View org-wide leave summary, document expiry alerts
3. **Leaves** → Review and approve/reject all organization leave requests
4. **Documents** → Check expiring documents (visas, passports, contracts)
5. **Compliance** → Send reminders for document renewals
6. **Users** → Manage employee onboarding/offboarding
7. **Reports** → Generate leave usage and compliance reports

### Admin Daily Flow
1. **Login** → Redirected to Admin Dashboard
2. **Dashboard** → System health, user activity, recent changes
3. **Users** → Create/edit/deactivate user accounts
4. **Roles** → Assign/change user roles and permissions
5. **Settings** → Configure departments, projects, leave policies
6. **Reports** → Generate system-wide reports
7. **Audit** → Review activity logs and system usage

### Employer Daily Flow
1. **Login** → Redirected to Employer Dashboard
2. **Dashboard** → Executive summary, revenue metrics, organization analytics
3. **Analytics** → View billable hours, team utilization, project profitability
4. **Financial** → Revenue trends, cost analysis, budget tracking
5. **Reports** → Generate comprehensive reports (export as PDF/Excel)
6. **Settings** → Organization branding, policies, system configuration
7. **Overview** → Monitor all operations across the organization

---

**Target Users**: Small to large organizations managing 10-1000+ employees  
**Last Updated**: November 2, 2025
