# Backend Refactoring Plan

## Status: In Progress

### ✅ Completed
1. Created shared types package (`shared/types/index.ts`)
2. Fixed role-based authorization in routes:
   - Removed EMPLOYER from timesheet creation routes
   - Removed EMPLOYER from leave creation routes
   - Added proper authorization to document routes
   - Fixed user routes to use `authorizeSelfOrRole`
3. Updated backend tsconfig to include shared types path

### 🔄 In Progress
1. Update backend to use shared types
2. Update frontend to use shared types
3. Check API sync between frontend and backend
4. Fix missing functionalities

### 📋 Remaining Tasks

#### 1. Backend Type Updates
- [ ] Update `backend/src/types/index.ts` to re-export from `@shared/types`
- [ ] Update all backend imports to use shared types
- [ ] Ensure all enums match (e.g., `FULL_TIME` vs `full-time`)

#### 2. Frontend Type Updates
- [ ] Update `frontend/src/app/core/models/user.model.ts` to use shared types
- [ ] Update all frontend imports
- [ ] Fix enum value mismatches

#### 3. API Sync Check
- [ ] Verify all frontend service endpoints match backend routes
- [ ] Check request/response interfaces match
- [ ] Fix status enum mismatches (e.g., 'Draft' vs 'draft')

#### 4. Role-Based Access Control
- [ ] Verify all routes have proper authorization
- [ ] Check controllers validate user ownership
- [ ] Ensure tenant isolation in all queries

#### 5. Missing Functionalities
- [ ] Check notification routes
- [ ] Check report routes
- [ ] Verify all CRUD operations are implemented

#### 6. Code Quality
- [ ] Remove duplicate code
- [ ] Use utils consistently
- [ ] Ensure proper error handling
- [ ] Add missing validations


