# Missing Functionality Roadmap - v2.2.0

**Employee Portal - Multi-Tenant Application**  
**Current Version**: 2.1.0  
**Target Version**: 2.2.0  
**Date**: November 12, 2025

---

## 📊 Overview

This document outlines the remaining missing functionality and provides a systematic roadmap for implementation in v2.2.0 and beyond. Analysis based on comprehensive codebase review and the original `MISSING_FUNCTIONALITY_ANALYSIS.md`.

---

## ✅ What's Already Complete (v2.1.0)

### Fully Functional Features:
- ✅ Authentication & Authorization (JWT + Role-based)
- ✅ Permission System (30+ permissions, 6 roles)
- ✅ User Management (CRUD + profile)
- ✅ Timesheet Management (Weekly grid + approval)
- ✅ Leave Management (Request + approval with balance tracking)
- ✅ Document Management (Upload/Download)
- ✅ Notification System (Email notifications on approvals/rejections)
- ✅ Project Management (CRUD operations - Admin UI)
- ✅ Report Export Infrastructure (PDF/Excel utilities)
- ✅ Bulk Operations Infrastructure (endpoints created)
- ✅ 6 Role-based Dashboards (UI created)
- ✅ Navigation System (Dynamic, permission-based)
- ✅ Route Guards (auth, role, permission)
- ✅ Utilities (50+ reusable functions - APPLIED)
- ✅ Type Safety (100% - shared types)
- ✅ DayJs Integration (all date operations)
- ✅ Toast Notifications (UI feedback)
- ✅ Error Interceptor (Global error handling)

---

## 🔴 HIGH PRIORITY - Phase 1 (Week 1-2)

### 1. Complete Project Management Integration ⚠️

**Status**: Backend & UI exist, but not fully integrated with timesheets

**Missing**:
- [ ] **Timesheet Project Dropdown** - Link projects to timesheet entries
  - Get user's assigned projects API
  - Project assignment to users (many-to-many)
  - Update timesheet UI to use project dropdown (not free text)
  - Filter: Active projects only
  - Show project metadata (client, budget remaining)
  
- [ ] **Project Assignment System**
  - Assign users to projects (Admin/PM)
  - Bulk project assignment
  - Project team view
  - User's projects view
  - Project-based reporting

**Estimated Effort**: 12-16 hours

**Files to Modify**:
- `backend/src/controllers/project.controller.ts` - Add assignment endpoints
- `backend/src/models/project.model.ts` - Add assignedUsers field
- `frontend/src/app/services/project.service.ts` - Add assignment methods
- `frontend/src/app/features/timesheets/components/weekly-grid.component.ts` - Use project dropdown
- `frontend/src/app/features/admin/projects/project-management.component.ts` - Add assignment UI

---

### 2. Fix Create User Functionality ⚠️

**Status**: Endpoint exists, but may have validation issues

**Missing**:
- [ ] **Verify Create User Flow**
  - Test password validation (using shared constants)
  - Test role assignment
  - Test employee fields (conditional)
  - Test reportingTo assignment
  
- [ ] **Enhance User Creation**
  - Send welcome email with temporary password
  - Force password change on first login
  - Email verification flow
  - Better error messages

**Estimated Effort**: 6-8 hours

**Files to Modify**:
- `backend/src/controllers/user.controller.ts` - Enhance createUser
- `backend/src/services/notification.service.ts` - Add welcome email
- `frontend/src/app/features/admin/users/create-user-dialog.component.ts` - Improve error handling

---

### 3. Dashboard Data Population ⚠️

**Status**: Dashboard UIs exist, but widgets show placeholder data

**Missing**:
- [ ] **Populate All Dashboard Widgets**
  - Admin Dashboard: Real user counts, recent activities
  - Employee Dashboard: Real timesheet summary, leave balance
  - HR Dashboard: Real pending approvals, team statistics
  - Supervisor Dashboard: Real team data
  - Employer Dashboard: Real business metrics
  - Prospect Dashboard: Real onboarding steps
  
- [ ] **Add Chart Integration**
  - Install chart library (Chart.js or ngx-charts)
  - Timesheet hours by week/month
  - Leave trends
  - Department-wise statistics
  - Project-wise time distribution

**Estimated Effort**: 16-20 hours

**Files to Modify**:
- All dashboard components in `frontend/src/app/features/dashboards/`
- Create new `DashboardService` for data aggregation
- Backend: Add dashboard data endpoints in `backend/src/controllers/dashboard.controller.ts`

---

### 4. Notification Enhancements 🆕

**Status**: Email notifications work, but in-app notifications don't show in UI

**Missing**:
- [ ] **In-App Notifications UI**
  - Notification bell icon with badge (unread count)
  - Notification dropdown (last 10)
  - Mark as read functionality
  - View all notifications page
  - Real-time updates (polling or WebSocket)
  
- [ ] **Notification Preferences**
  - User settings for notification types
  - Email vs in-app toggle
  - Notification frequency (immediate, digest)
  - Quiet hours configuration

**Estimated Effort**: 10-14 hours

**Files to Modify**:
- `frontend/src/app/core/layout/top-nav/top-nav.component.ts` - Add notification bell
- Create `NotificationDropdownComponent`
- `frontend/src/app/services/notification.service.ts` - Add polling/real-time
- `backend/src/controllers/notification.controller.ts` - Add markAsRead endpoint

---

## 🟡 MEDIUM PRIORITY - Phase 2 (Week 3-4)

### 5. Complete Report Export Implementation 📊

**Status**: Utilities exist, but not fully integrated

**Missing**:
- [ ] **PDF Generation** - Complete integration
  - Timesheet PDF (weekly/monthly)
  - Leave report PDF
  - Team report PDF
  - Custom headers/footers with branding
  
- [ ] **Excel Generation** - Complete integration
  - Timesheet Excel export
  - Leave report Excel
  - User list Excel
  - Formatted worksheets with formulas
  
- [ ] **Report UI**
  - Report selection UI (date range, filters)
  - Download progress indicator
  - Report history
  - Email report option

**Estimated Effort**: 14-18 hours

**Files to Modify**:
- `backend/src/controllers/report-export.controller.ts` - Complete implementations
- `backend/src/utils/pdf-generator.util.ts` - Enhance templates
- `backend/src/utils/excel-generator.util.ts` - Enhance formatting
- Create `ReportComponent` in frontend

---

### 6. Complete Bulk Operations 📦

**Status**: Endpoints exist, but UI and full logic missing

**Missing**:
- [ ] **Bulk User Creation**
  - CSV import UI
  - Excel import UI
  - Template download
  - Validation before import
  - Error reporting (which rows failed)
  - Success summary
  
- [ ] **Bulk Timesheet Operations**
  - Copy week to next week
  - Bulk approve/reject
  - Import from Excel
  - Templates for common projects
  
- [ ] **Bulk Document Upload**
  - Multiple file selection
  - Drag & drop
  - Bulk category assignment
  - Progress bar for each file

**Estimated Effort**: 16-20 hours

**Files to Modify**:
- `backend/src/controllers/bulk.controller.ts` - Implement logic
- Create `BulkImportComponent` in frontend
- Add CSV/Excel parsing utilities

---

### 7. System Settings UI 🎛️

**Status**: Backend settings exist, but no UI

**Missing**:
- [ ] **Organization Settings**
  - Working hours (start, end, break)
  - Holiday calendar management (add/edit/delete holidays)
  - Department CRUD
  - Location CRUD
  - Fiscal year configuration
  
- [ ] **Email Settings**
  - SMTP configuration UI
  - Email template customization (HTML editor)
  - Test email button
  - Email notification toggles (which events trigger emails)
  
- [ ] **Leave Policy Configuration**
  - Leave types (add/edit/delete)
  - Accrual rates per leave type
  - Maximum carry-over
  - Probation period rules
  - Encashment rules

**Estimated Effort**: 18-24 hours

**Files to Modify**:
- Enhance `frontend/src/app/features/admin/settings/system-settings.component.ts`
- Create new settings components for each category
- Add backend endpoints for each setting type

---

### 8. Leave Balance Auto-Calculation 🗓️

**Status**: Manual balance tracking exists, no auto-accrual

**Missing**:
- [ ] **Monthly Accrual**
  - Scheduled job (cron) to run monthly
  - Calculate accrual based on leave policy
  - Pro-rated for new joiners
  - Add accrual history log
  
- [ ] **Annual Reset**
  - Scheduled job to run annually
  - Carry-over calculation (max limit)
  - Reset balances
  - Notification to users
  
- [ ] **Leave Calculations**
  - Working days calculation (excluding holidays)
  - Half-day leave support
  - Sandwich leave detection
  - Negative balance alerts

**Estimated Effort**: 12-16 hours

**Files to Create**:
- `backend/src/jobs/leave-accrual.job.ts` - Scheduled job
- `backend/src/services/leave-calculation.service.ts` - Calculation logic

**Files to Modify**:
- `backend/src/controllers/leave.controller.ts` - Use calculation service
- `backend/src/models/leave-balance-history.model.ts` - New model

---

### 9. User Profile Enhancements 👤

**Status**: Basic profile exists

**Missing**:
- [ ] **Avatar Upload**
  - Image upload functionality
  - Crop/resize UI
  - Default avatars (initials-based)
  - Remove avatar
  - Display avatars throughout app
  
- [ ] **Profile Completeness**
  - Calculate completion percentage
  - Show missing fields
  - Prompt to complete profile
  - Profile verification status
  
- [ ] **Password Strength Indicator**
  - Real-time strength meter in UI
  - Visual feedback (weak/medium/strong)
  - Password requirements checklist

**Estimated Effort**: 10-12 hours

**Files to Modify**:
- `frontend/src/app/features/profile/profile.component.ts` - Add avatar upload
- `backend/src/controllers/user.controller.ts` - Add avatar endpoint
- `backend/src/utils/file-upload.util.ts` - Image processing

---

## 🟢 LOW PRIORITY - Phase 3 (Month 2+)

### 10. Approval History & Audit Trail 📜

**Status**: Approvals work, but no history/audit

**Missing**:
- [ ] **Approval History**
  - View all approvals by user
  - Filter by date, type, status
  - Audit trail with timestamps
  - Comments history
  
- [ ] **Activity Logging**
  - Log all CRUD operations
  - User activity tracking
  - Login/logout tracking
  - Failed login attempts
  
- [ ] **Audit Reports**
  - Activity reports
  - Security reports
  - Export audit logs

**Estimated Effort**: 14-18 hours

---

### 11. Document Versioning 📄

**Status**: Basic document management exists

**Missing**:
- [ ] **Version Control**
  - Track document versions
  - Version numbering (v1.0, v1.1, v2.0)
  - Version metadata
  - Version comparison (diff)
  
- [ ] **Version Management**
  - Download specific version
  - Rollback to previous version
  - Delete old versions
  - Version comments

**Estimated Effort**: 12-16 hours

---

### 12. Search & Filter Enhancements 🔍

**Status**: Basic search exists

**Missing**:
- [ ] **Global Search**
  - Search across all modules
  - Quick search results
  - Recent searches
  - Search suggestions
  
- [ ] **Advanced Filters**
  - Multi-criteria filtering
  - Date range filters
  - Status filters
  - Save filter combinations

**Estimated Effort**: 10-14 hours

---

### 13. Mobile Optimization 📱

**Status**: Responsive layout exists, but not optimized

**Missing**:
- [ ] **Mobile UI Improvements**
  - Touch-friendly controls
  - Swipe gestures
  - Mobile-specific navigation
  - Optimized forms
  
- [ ] **Progressive Web App (PWA)**
  - Service worker
  - Offline support
  - Install prompt
  - Push notifications

**Estimated Effort**: 16-20 hours

---

### 14. Performance Optimization ⚡

**Status**: Basic pagination exists

**Missing**:
- [ ] **Caching Strategy**
  - Frontend data caching
  - API response caching
  - Cache invalidation
  - Service worker caching
  
- [ ] **Lazy Loading**
  - Lazy load images
  - Infinite scroll
  - Virtual scrolling for large lists
  
- [ ] **Code Optimization**
  - Bundle size reduction
  - Tree shaking
  - Code splitting
  - Image optimization

**Estimated Effort**: 12-16 hours

---

### 15. Advanced Features 🚀

**Status**: Not started

**Missing**:
- [ ] **Two-Factor Authentication (2FA)**
  - TOTP setup (Google Authenticator)
  - Backup codes
  - SMS OTP (optional)
  
- [ ] **Single Sign-On (SSO)**
  - OAuth integration
  - SAML support
  - Azure AD integration
  
- [ ] **API Key Management**
  - Generate API keys
  - Key rotation
  - Rate limiting per key
  
- [ ] **Webhook Configuration**
  - Configure webhooks for events
  - Webhook logs
  - Retry logic

**Estimated Effort**: 24-30 hours

---

## 📅 Implementation Roadmap

### Phase 1: Critical Features (Week 1-2) - 44-58 hours
**Priority**: HIGH - Required for basic completeness

1. Complete Project Management Integration (12-16h)
2. Fix Create User Functionality (6-8h)
3. Dashboard Data Population (16-20h)
4. Notification Enhancements (10-14h)

**Deliverables**:
- ✅ Timesheets linked to actual projects
- ✅ User creation working perfectly
- ✅ Dashboards showing real data
- ✅ In-app notifications visible

---

### Phase 2: Essential Features (Week 3-4) - 70-90 hours
**Priority**: MEDIUM - Required for production readiness

5. Complete Report Export (14-18h)
6. Complete Bulk Operations (16-20h)
7. System Settings UI (18-24h)
8. Leave Balance Auto-Calculation (12-16h)
9. User Profile Enhancements (10-12h)

**Deliverables**:
- ✅ Reports can be exported (PDF/Excel)
- ✅ Bulk imports working
- ✅ System configurable via UI
- ✅ Leaves auto-accrued
- ✅ Profile pictures and completeness

---

### Phase 3: Advanced Features (Month 2) - 60-80 hours
**Priority**: LOW - Nice-to-have for enhanced experience

10. Approval History & Audit Trail (14-18h)
11. Document Versioning (12-16h)
12. Search & Filter Enhancements (10-14h)
13. Mobile Optimization (16-20h)
14. Performance Optimization (12-16h)

**Deliverables**:
- ✅ Full audit trail
- ✅ Document versions
- ✅ Advanced search
- ✅ Mobile-optimized
- ✅ Fast & cached

---

### Phase 4: Enterprise Features (Month 3+) - 24-30 hours
**Priority**: FUTURE - Enterprise-grade features

15. Advanced Features (2FA, SSO, API Keys, Webhooks)

**Deliverables**:
- ✅ 2FA for security
- ✅ SSO integration
- ✅ API access
- ✅ Webhook events

---

## 📊 Effort Summary

| Phase | Priority | Features | Estimated Hours | Timeline |
|-------|----------|----------|----------------|----------|
| Phase 1 | HIGH | 4 | 44-58 | Week 1-2 |
| Phase 2 | MEDIUM | 5 | 70-90 | Week 3-4 |
| Phase 3 | LOW | 5 | 60-80 | Month 2 |
| Phase 4 | FUTURE | 1 | 24-30 | Month 3+ |
| **TOTAL** | | **15** | **198-258** | **3-4 months** |

---

## 🎯 Recommended Next Steps

### Immediate (This Week):
1. ✅ Complete Project Management Integration
   - Link projects to timesheets (highest impact)
   - Project assignment system
   
2. ✅ Fix & Test Create User
   - Verify all validations
   - Add welcome email
   
3. ✅ Populate Dashboard Data
   - Connect widgets to real data
   - Add basic charts

### Next Week:
4. ✅ In-App Notifications
   - Notification bell with dropdown
   - Real-time updates

### Following Weeks:
5. Report Export
6. Bulk Operations
7. System Settings UI

---

## 💡 Technical Debt to Address

### Current Issues:
1. ⚠️ **Frontend Forms** - Some forms still use basic validators instead of ValidatorsUtil
2. ⚠️ **Error Messages** - Generic error messages, need to be more specific
3. ⚠️ **Loading States** - Not all components show loading spinners
4. ⚠️ **Empty States** - Need empty state UIs (no data messages)
5. ⚠️ **Confirmation Dialogs** - Delete operations should have confirmation
6. ⚠️ **Mobile Testing** - Need comprehensive mobile device testing

---

## 🔄 Continuous Improvements

### Should Be Done Alongside Each Phase:
- [ ] **Testing** - Write unit tests for new features
- [ ] **Documentation** - Update API documentation
- [ ] **Code Review** - Peer review all changes
- [ ] **Performance Monitoring** - Track page load times
- [ ] **Security Audit** - Regular security reviews
- [ ] **User Feedback** - Collect and incorporate feedback

---

## ✅ Success Criteria

### v2.2.0 will be considered complete when:
- [x] All Phase 1 features implemented and tested
- [ ] All Phase 2 features implemented and tested
- [ ] User acceptance testing passed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Migration guide created

---

## 📝 Notes

### Dependencies:
- **Charts**: Need to install chart library (ngx-charts or chart.js)
- **Image Processing**: Need library for avatar cropping (ngx-image-cropper)
- **Excel/CSV**: Already have exceljs, need csv-parser
- **Cron Jobs**: Already have node-cron for scheduled tasks

### Breaking Changes:
- Project field in timesheet will change from `string` to `ObjectId`
  - Migration script required
- Leave balance history will be tracked separately
  - New collection required

---

**Document Version**: 2.2.0  
**Status**: Planning  
**Last Updated**: November 12, 2025  
**Owner**: Development Team

---

## 🚦 Status Legend

- 🔴 **HIGH PRIORITY** - Critical for basic functionality
- 🟡 **MEDIUM PRIORITY** - Important for production readiness
- 🟢 **LOW PRIORITY** - Nice-to-have enhancements
- ⚠️ **PARTIALLY COMPLETE** - Started but not finished
- ❌ **NOT STARTED** - No code exists
- ✅ **COMPLETE** - Fully implemented and tested

