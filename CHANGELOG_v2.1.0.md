# Changelog - v2.1.0

**Release Date**: November 12, 2025  
**Type**: Major Refactoring Release

---

## ✅ Added

### New Features (5):
1. **Project Management**
   - Complete CRUD operations
   - Admin UI
   - 6 API endpoints
   - Search & filter

2. **Notification System**
   - Email notifications (approvals/rejections)
   - In-app notifications
   - Auto-send on workflows

3. **Bulk Operations**
   - Bulk create users
   - Bulk update roles/status
   - Bulk approve timesheets
   - Bulk share documents

4. **Report Export**
   - PDF export (timesheet, leave, team)
   - Excel export (timesheet, leave, team)
   - Filtered exports

5. **Toast Notifications**
   - Global UI notifications
   - Error interceptor
   - Success/error/warning/info types

### New Utilities (8):
1. `backend/utils/request-validator.util.ts` (281 lines)
2. `backend/utils/business-logic.util.ts` (379 lines)
3. `backend/middleware/permission.middleware.ts` (92 lines)
4. `frontend/shared/utils/validators.util.ts` (433 lines)
5. `frontend/shared/utils/response-handler.util.ts` (151 lines)
6. `frontend/shared/utils/date-helper.util.ts` (250 lines)
7. `frontend/core/guards/permission.guard.ts` (77 lines)
8. `frontend/core/interceptors/error.interceptor.ts` (89 lines)

### New Services (4):
1. `backend/services/project.service.ts`
2. `backend/services/notification.service.ts` (enhanced)
3. `frontend/services/project.service.ts`
4. `frontend/core/services/navigation.service.ts`

---

## ♻️ Refactored

### Controllers (3):
1. **leave.controller.ts**
   - Applied RequestValidator (8 locations)
   - Applied BusinessLogic (6 locations)
   - Integrated notifications
   - Removed 60+ lines duplicate code

2. **timesheet.controller.ts**
   - Applied RequestValidator (10 locations)
   - Applied BusinessLogic (8 locations)
   - Integrated notifications
   - Removed 80+ lines duplicate code

3. **notification.controller.ts**
   - Refactored to use NotificationService
   - Applied RequestValidator (6 locations)
   - Removed 40+ lines duplicate code

### Date Operations:
- All date operations converted to DayJs
- Removed buggy native Date usage
- Added DayJs plugins (isoWeek, relativeTime, quarterOfYear)

---

## 🔧 Changed

### Backend:
- Enhanced leave approval with auto balance deduction
- Enhanced timesheet/leave approval with notifications
- Added validation to all controllers
- Improved error logging

### Frontend:
- Added global error interceptor
- Added toast notification service
- Enhanced route guards
- Improved validation

### Shared:
- Added validation constants
- Enhanced permission system

---

## 🗑️ Removed

- 180+ lines of duplicate validation code
- Native Date operations (replaced with DayJs)
- Hardcoded validation rules (moved to shared constants)
- Duplicate README files (consolidated to v2.1.0)

---

## 📁 Files

**Created**: 25 files (4,500+ lines)  
**Modified**: 15 files (500+ lines changed)  
**Removed**: 7 duplicate documentation files

---

## 🐛 Fixed

1. Date bugs (native Date → DayJs)
2. Missing leave balance deduction
3. Missing notifications on approvals
4. Missing project management
5. Missing bulk operations
6. Missing report export
7. Duplicate validation code

---

## 🔒 Security

- Enhanced permission-based middleware
- Input validation on all endpoints
- ObjectId validation
- Tenant isolation validation
- User ownership validation

---

## ⚡ Performance

- Reduced duplicate code
- Optimized date calculations
- Efficient bulk operations
- Reusable utility functions

---

## 📚 Documentation

**Kept (Essential)**:
- README.md - Main project documentation
- APPLICATION_STRUCTURE_GUIDE.md - Architecture guide
- ARCHITECTURE_REFACTOR_SUMMARY.md - Permission system
- MISSING_FUNCTIONALITY_ANALYSIS.md - Gap analysis
- REFACTORING_v2.1.0.md - This refactoring documentation
- CHANGELOG_v2.1.0.md - This changelog

**Archived** (to md_archive/):
- All old refactoring summaries
- All duplicate status files
- All old implementation trackers

---

## 🔄 Migration Guide

### Using New Utilities:

**Backend:**
```typescript
// Old
if (!req.user?.tenantId) return res.status(401).json({...});

// New
if (!RequestValidator.validateTenantContext(req, res)) return;
```

**Frontend:**
```typescript
// Old
const now = new Date();

// New  
import { DateHelper } from '@shared/utils';
const now = DateHelper.formatDate(new Date());
```

---

## ✅ Verification

- [x] Backend builds successfully
- [x] Frontend builds successfully
- [x] 0 TypeScript errors
- [x] 0 linting errors
- [x] All utilities applied
- [x] All features tested
- [x] Documentation consolidated

---

**Version**: 2.1.0  
**Status**: Production Ready ✅

