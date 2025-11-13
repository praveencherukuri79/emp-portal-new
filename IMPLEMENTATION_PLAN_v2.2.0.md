# Implementation Plan - v2.2.0

**Target Version**: 2.2.0  
**Start Date**: November 12, 2025  
**Status**: 🔄 IN PROGRESS

---

## 🎯 Objective

Complete ALL missing functionality identified in `MISSING_FUNCTIONALITY_ANALYSIS.md`. No half-done features, complete implementation from backend to frontend with testing.

---

## 📋 Implementation Phases

### ✅ Phase 0: Preparation (DONE)
- [x] Identify all missing features
- [x] Prioritize by impact
- [x] Create implementation plan
- [x] Set up TODO tracking

---

### 🔴 Phase 1: HIGH PRIORITY Features (Critical)

#### 1A. Project Assignment System ⭐ MOST IMPORTANT
**Status**: 🔄 IN PROGRESS  
**Estimated Time**: 12-16 hours

**Backend Tasks**:
- [ ] Update `Project` model - Add `assignedUsers: ObjectId[]` field
- [ ] Add `POST /api/v1/projects/:id/assign` - Assign user(s) to project
- [ ] Add `DELETE /api/v1/projects/:id/unassign` - Remove user from project
- [ ] Add `GET /api/v1/projects/my-projects` - Get current user's assigned projects
- [ ] Add `GET /api/v1/projects/:id/team` - Get project team members
- [ ] Update project DTOs to include team info

**Frontend Tasks**:
- [ ] Add `getMyProjects()` method to `ProjectService`
- [ ] Add `assignUsers()` method to `ProjectService`
- [ ] Add `unassignUser()` method to `ProjectService`
- [ ] Add team management UI to Project Management component
- [ ] Add "Assign Team" dialog with user multi-select

**Files to Create/Modify**:
- `backend/src/models/project.model.ts` - Add assignedUsers field
- `backend/src/controllers/project.controller.ts` - Add assignment methods
- `backend/src/routes/project.routes.ts` - Add new routes
- `frontend/src/app/services/project.service.ts` - Add assignment methods
- `frontend/src/app/features/admin/projects/project-management.component.ts` - Add team UI

---

#### 1B. Link Timesheets to Projects
**Status**: ⏳ PENDING  
**Estimated Time**: 6-8 hours

**Backend Tasks**:
- [ ] Update `TimesheetEntry` model - Change `project: string` to `project: ObjectId` (reference to Project)
- [ ] Migration script to convert existing string projects to ObjectId (create projects if needed)
- [ ] Update timesheet DTOs to populate project details
- [ ] Validate project assignment (user must be assigned to project)

**Frontend Tasks**:
- [ ] Update timesheet weekly grid - Replace text input with dropdown
- [ ] Load user's assigned projects for dropdown
- [ ] Display project client and status in dropdown
- [ ] Show project name (not ID) in timesheet list
- [ ] Update timesheet service to use ObjectId

**Migration**:
- [ ] Create migration script: `backend/src/migrations/001-convert-projects.ts`
- [ ] For each unique project string, create Project document
- [ ] Update all timesheet entries to reference Project ObjectId

**Files to Create/Modify**:
- `backend/src/models/timesheet.model.ts` - Update project field type
- `backend/src/migrations/001-convert-projects.ts` - Migration script
- `frontend/src/app/features/timesheets/components/weekly-grid.component.ts` - Dropdown UI
- `frontend/src/app/features/timesheets/components/weekly-grid.component.html` - Update template

---

#### 1C. Dashboard Data Population
**Status**: ⏳ PENDING  
**Estimated Time**: 16-20 hours

**Backend Tasks**:
- [ ] Create `DashboardService` with aggregation queries
- [ ] Add `GET /api/v1/dashboard/admin` - Admin stats
- [ ] Add `GET /api/v1/dashboard/employee` - Employee stats
- [ ] Add `GET /api/v1/dashboard/hr` - HR stats
- [ ] Add `GET /api/v1/dashboard/supervisor` - Supervisor stats
- [ ] Add `GET /api/v1/dashboard/employer` - Employer stats
- [ ] Add `GET /api/v1/dashboard/prospect` - Prospect stats
- [ ] Optimize queries with indexes

**Frontend Tasks**:
- [ ] Create `DashboardService` in frontend
- [ ] Update Admin Dashboard - Connect to real data
- [ ] Update Employee Dashboard - Connect to real data
- [ ] Update HR Dashboard - Connect to real data
- [ ] Update Supervisor Dashboard - Connect to real data
- [ ] Update Employer Dashboard - Connect to real data
- [ ] Update Prospect Dashboard - Connect to real data
- [ ] Install chart library (ngx-charts)
- [ ] Add timesheet hours chart
- [ ] Add leave trends chart
- [ ] Add department stats chart

**Chart Integration**:
- [ ] Install: `npm install @swimlane/ngx-charts --save`
- [ ] Add to imports in dashboard components
- [ ] Create chart components for reusability

**Files to Create/Modify**:
- `backend/src/services/dashboard.service.ts` - NEW
- `backend/src/controllers/dashboard.controller.ts` - Enhance existing
- `backend/src/routes/dashboard.routes.ts` - Add new routes
- `frontend/src/app/services/dashboard.service.ts` - NEW
- All 6 dashboard components in `frontend/src/app/features/dashboards/`

---

#### 1D. Notification Bell UI
**Status**: ⏳ PENDING  
**Estimated Time**: 10-14 hours

**Backend Tasks**:
- [ ] Add `PATCH /api/v1/notifications/:id/read` - Mark as read
- [ ] Add `PATCH /api/v1/notifications/read-all` - Mark all as read
- [ ] Add `GET /api/v1/notifications/unread-count` - Get unread count
- [ ] Optimize notification queries

**Frontend Tasks**:
- [ ] Create `NotificationDropdownComponent`
- [ ] Add notification bell icon to TopNav
- [ ] Add unread count badge
- [ ] Dropdown shows last 10 notifications
- [ ] Add "Mark as Read" functionality
- [ ] Add "View All" link to notifications page
- [ ] Create full notifications page
- [ ] Add polling/real-time updates (every 30 seconds)
- [ ] Style notifications by type (info, success, warning)

**Files to Create/Modify**:
- `backend/src/controllers/notification.controller.ts` - Add mark-as-read
- `backend/src/routes/notification.routes.ts` - Add new routes
- `frontend/src/app/shared/components/notification-dropdown/` - NEW component
- `frontend/src/app/core/layout/top-nav/top-nav.component.ts` - Add bell
- `frontend/src/app/features/notifications/` - NEW full page
- `frontend/src/app/services/notification.service.ts` - Add polling

---

### 🟡 Phase 2: MEDIUM PRIORITY Features (Production-Ready)

#### 2A. Complete Report Export
**Status**: ⏳ PENDING  
**Estimated Time**: 14-18 hours

**Backend Tasks**:
- [ ] Test PDF generation - Timesheet report
- [ ] Test PDF generation - Leave report
- [ ] Test PDF generation - Team report
- [ ] Test Excel generation - Timesheet report
- [ ] Test Excel generation - Leave report
- [ ] Test Excel generation - User list
- [ ] Add company branding to PDF headers
- [ ] Add filters validation

**Frontend Tasks**:
- [ ] Create `ReportComponent` with report selection
- [ ] Add date range picker
- [ ] Add filter options (user, department, project)
- [ ] Add "Download PDF" button
- [ ] Add "Download Excel" button
- [ ] Show download progress
- [ ] Handle large file downloads
- [ ] Add report history (optional)

**Files to Create/Modify**:
- `backend/src/controllers/report-export.controller.ts` - Test & fix
- `backend/src/utils/pdf-generator.util.ts` - Enhance templates
- `backend/src/utils/excel-generator.util.ts` - Enhance formatting
- `frontend/src/app/features/reports/` - NEW component

---

#### 2B. Bulk Operations UI
**Status**: ⏳ PENDING  
**Estimated Time**: 16-20 hours

**Backend Tasks**:
- [ ] Implement bulk user creation logic
- [ ] Add CSV parsing for users
- [ ] Add Excel parsing for users
- [ ] Validation before import (check duplicates, required fields)
- [ ] Return detailed errors (which rows failed, why)
- [ ] Implement bulk timesheet creation
- [ ] Implement bulk document upload

**Frontend Tasks**:
- [ ] Create `BulkImportComponent`
- [ ] Add CSV/Excel file upload
- [ ] Add drag & drop support
- [ ] Download template functionality
- [ ] Show preview before import
- [ ] Validation UI (show errors before submit)
- [ ] Progress bar during import
- [ ] Success/error summary after import
- [ ] Add to Admin menu

**NPM Packages**:
- Backend: `csv-parser` (already have exceljs)
- Frontend: File upload component

**Files to Create/Modify**:
- `backend/src/controllers/bulk.controller.ts` - Implement logic
- `backend/src/utils/csv-parser.util.ts` - NEW
- `frontend/src/app/features/admin/bulk-import/` - NEW component

---

#### 2C. System Settings UI
**Status**: ⏳ PENDING  
**Estimated Time**: 18-24 hours

**Backend Tasks**:
- [ ] Create `Settings` model (if not exists)
- [ ] Add `GET /api/v1/settings/organization` - Get org settings
- [ ] Add `PUT /api/v1/settings/organization` - Update org settings
- [ ] Add `GET /api/v1/settings/holidays` - Get holidays
- [ ] Add `POST /api/v1/settings/holidays` - Add holiday
- [ ] Add `DELETE /api/v1/settings/holidays/:id` - Delete holiday
- [ ] Add `GET /api/v1/settings/departments` - Get departments
- [ ] Add `POST /api/v1/settings/departments` - Add department
- [ ] Add `PUT /api/v1/settings/departments/:id` - Update department
- [ ] Add `DELETE /api/v1/settings/departments/:id` - Delete department
- [ ] Add `GET /api/v1/settings/email` - Get email config
- [ ] Add `PUT /api/v1/settings/email` - Update email config
- [ ] Add `POST /api/v1/settings/email/test` - Send test email

**Frontend Tasks**:
- [ ] Create `OrganizationSettingsComponent`
- [ ] Working hours configuration
- [ ] Holiday calendar management (add/edit/delete)
- [ ] Department CRUD UI
- [ ] Create `EmailSettingsComponent`
- [ ] SMTP configuration form
- [ ] Test email button
- [ ] Create `LeaveSettingsComponent`
- [ ] Leave types CRUD
- [ ] Accrual rates configuration
- [ ] Carry-over rules
- [ ] Add tabs to SystemSettingsComponent

**Files to Create/Modify**:
- `backend/src/models/settings.model.ts` - NEW (or enhance existing)
- `backend/src/controllers/settings.controller.ts` - Enhance
- `backend/src/routes/settings.routes.ts` - Add routes
- `frontend/src/app/features/admin/settings/` - Create sub-components

---

#### 2D. Leave Auto-Accrual
**Status**: ⏳ PENDING  
**Estimated Time**: 12-16 hours

**Backend Tasks**:
- [ ] Install `node-cron` for scheduling
- [ ] Create `LeaveAccrualService`
- [ ] Implement monthly accrual calculation
- [ ] Pro-rated accrual for new joiners
- [ ] Create accrual history model
- [ ] Create scheduled job: Monthly accrual
- [ ] Create scheduled job: Annual reset
- [ ] Add manual trigger endpoint (for testing)
- [ ] Send email notifications on accrual

**Frontend Tasks**:
- [ ] Add "Accrual History" tab to leave page
- [ ] Display accrual history table
- [ ] Show next accrual date
- [ ] Manual trigger button (Admin only)

**Files to Create/Modify**:
- `backend/src/models/leave-accrual-history.model.ts` - NEW
- `backend/src/services/leave-accrual.service.ts` - NEW
- `backend/src/jobs/leave-accrual.job.ts` - NEW
- `backend/src/server.ts` - Register cron jobs
- `frontend/src/app/features/leaves/` - Add history component

---

#### 2E. Avatar Upload
**Status**: ⏳ PENDING  
**Estimated Time**: 10-12 hours

**Backend Tasks**:
- [ ] Add `POST /api/v1/users/avatar` - Upload avatar
- [ ] Add `DELETE /api/v1/users/avatar` - Remove avatar
- [ ] Install image processing library (sharp)
- [ ] Implement image resize (max 500x500)
- [ ] Save to `uploads/avatars/` folder
- [ ] Generate default avatar from initials (optional)
- [ ] Update user model with avatar URL

**Frontend Tasks**:
- [ ] Add avatar upload to profile page
- [ ] Image file picker
- [ ] Image preview before upload
- [ ] Crop/resize UI (ngx-image-cropper)
- [ ] Display avatar in TopNav
- [ ] Display avatars in user lists
- [ ] Display avatars in approval lists
- [ ] Generate default avatar with initials

**NPM Packages**:
- Backend: `sharp` for image processing
- Frontend: `ngx-image-cropper`

**Files to Create/Modify**:
- `backend/src/controllers/user.controller.ts` - Add avatar methods
- `backend/src/utils/image-processor.util.ts` - NEW
- `frontend/src/app/features/profile/profile.component.ts` - Add upload UI
- `frontend/src/app/shared/components/avatar/` - NEW component

---

## 📊 Progress Tracking

### Overall Progress: 0% (0/10 phases complete)

| Phase | Feature | Priority | Status | Progress |
|-------|---------|----------|--------|----------|
| 1A | Project Assignment | HIGH | 🔄 In Progress | 0% |
| 1B | Link Timesheets to Projects | HIGH | ⏳ Pending | 0% |
| 1C | Dashboard Data | HIGH | ⏳ Pending | 0% |
| 1D | Notification Bell | HIGH | ⏳ Pending | 0% |
| 2A | Report Export | MEDIUM | ⏳ Pending | 0% |
| 2B | Bulk Operations | MEDIUM | ⏳ Pending | 0% |
| 2C | System Settings | MEDIUM | ⏳ Pending | 0% |
| 2D | Leave Accrual | MEDIUM | ⏳ Pending | 0% |
| 2E | Avatar Upload | MEDIUM | ⏳ Pending | 0% |
| Final | Testing & Docs | - | ⏳ Pending | 0% |

---

## 🎯 Success Criteria

Each phase is considered complete when:
- [ ] Backend implementation complete
- [ ] Frontend implementation complete
- [ ] Backend builds successfully (0 errors)
- [ ] Frontend builds successfully (0 errors)
- [ ] Feature tested manually
- [ ] No regressions in existing features
- [ ] Code committed to git

---

## 📝 Implementation Rules

1. **Complete One Phase at a Time** - No partial implementations
2. **Test After Each Phase** - Verify builds pass
3. **Commit After Each Phase** - Keep git history clean
4. **No Breaking Changes** - Maintain backward compatibility
5. **Update Documentation** - Keep docs in sync with code

---

## 🚀 Estimated Timeline

- **Phase 1 (HIGH)**: 44-58 hours (5-7 days)
- **Phase 2 (MEDIUM)**: 70-90 hours (9-11 days)
- **Testing & Docs**: 8-12 hours (1 day)
- **Total**: 122-160 hours (15-19 days)

---

## 📦 NPM Packages to Install

### Backend:
```bash
npm install sharp csv-parser
```

### Frontend:
```bash
npm install @swimlane/ngx-charts ngx-image-cropper
```

---

**Status**: 🔄 **ACTIVELY IMPLEMENTING**  
**Current Phase**: 1A - Project Assignment System  
**Last Updated**: November 12, 2025

