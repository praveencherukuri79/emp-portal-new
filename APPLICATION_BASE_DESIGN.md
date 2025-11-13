# Application Base Design

**Employee Portal - Multi-Tenant Application**  
**Version**: 2.1.0  
**Last Updated**: November 12, 2025

---

## 🏗️ Architecture Overview

### Multi-Tenant Architecture
- **Data Isolation**: Each tenant's data completely separated
- **Shared Infrastructure**: Single codebase serves all tenants
- **Tenant Context**: All requests validated for tenant ownership
- **Scalable**: Designed for multiple organizations

### Three-Tier Architecture
```
┌─────────────────────────────────────┐
│         Frontend (Angular)          │
│   - Components                      │
│   - Services                        │
│   - Guards & Interceptors           │
└─────────────────────────────────────┘
              ↓ HTTP/REST
┌─────────────────────────────────────┐
│       Backend (Node.js/Express)     │
│   - Controllers                     │
│   - Services                        │
│   - Middleware                      │
└─────────────────────────────────────┘
              ↓ Mongoose ODM
┌─────────────────────────────────────┐
│         Database (MongoDB)          │
│   - Collections per tenant          │
│   - Indexes for performance         │
└─────────────────────────────────────┘
```

---

## 🎯 Design Principles

### 1. Type Safety First
- **Shared Types**: Single source of truth in `shared/types/`
- **Full Stack Type Safety**: Frontend and backend use same types
- **No Type Mismatches**: Compile-time error detection

### 2. Permission-Based Authorization
- **Granular Control**: 30+ permissions defined
- **Role Configuration**: 6 roles with specific permissions
- **Single Source**: `shared/types/permissions.ts`
- **Consistent**: Same logic frontend & backend

### 3. Code Reusability
- **Shared Folder**: Types, constants, utilities shared
- **Backend Utils**: 16 utility modules
- **Frontend Utils**: 4 utility modules
- **DRY Principle**: No duplicate code

### 4. Separation of Concerns
```
Backend:
- Models: Data structure & validation
- Services: Business logic
- Controllers: Request handling
- DTOs: Data transformation
- Routes: Endpoint definition
- Middleware: Cross-cutting concerns

Frontend:
- Components: UI presentation
- Services: API communication
- Guards: Route protection
- Interceptors: HTTP manipulation
- Models: Type definitions
- Utilities: Helper functions
```

### 5. Clean Architecture
```
┌──────────────────────────────────────┐
│         Presentation Layer           │
│   (Components, UI, Routes)           │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│         Application Layer            │
│   (Services, Guards, Interceptors)   │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│          Domain Layer                │
│   (Business Logic, Utilities)        │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│       Infrastructure Layer           │
│   (Database, HTTP, External APIs)    │
└──────────────────────────────────────┘
```

---

## 📦 Module Design

### Backend Modules

#### 1. Authentication Module
- **Purpose**: User authentication & session management
- **Components**: 
  - Controllers: AuthController
  - Services: TokenUtil, PasswordUtil
  - Models: User, Tenant
  - Middleware: authenticate, optionalAuthenticate

#### 2. User Management Module
- **Purpose**: User CRUD and profile management
- **Components**:
  - Controllers: UserController
  - Services: UserService
  - Models: User
  - DTOs: toUserResponse, toUsersListResponse
  - Middleware: authorize, authorizeSelfOrRole

#### 3. Timesheet Module
- **Purpose**: Time tracking and approval
- **Components**:
  - Controllers: TimesheetController
  - Services: TimesheetService
  - Models: TimesheetEntry
  - DTOs: toTimesheetEntryResponse, toWeeklyTimesheetResponse
  - Utilities: getWeekDates, validateTimesheetHours

#### 4. Leave Module
- **Purpose**: Leave request and approval
- **Components**:
  - Controllers: LeaveController
  - Services: LeaveService
  - Models: LeaveRequest
  - DTOs: toLeaveRequestResponse
  - Utilities: calculateWorkingDays, hasSufficientLeaveBalance

#### 5. Document Module
- **Purpose**: Document storage and management
- **Components**:
  - Controllers: DocumentController
  - Services: DocumentService
  - Models: Document
  - DTOs: toDocumentResponse
  - Storage: File system (uploads/)

#### 6. Project Module (v2.1.0)
- **Purpose**: Project management
- **Components**:
  - Controllers: ProjectController
  - Services: ProjectService
  - Models: Project
  - DTOs: toProjectResponse

#### 7. Notification Module
- **Purpose**: Email and in-app notifications
- **Components**:
  - Controllers: NotificationController
  - Services: NotificationService, EmailUtil
  - Models: Notification
  - DTOs: toNotificationResponse

#### 8. Report Module
- **Purpose**: Reporting and analytics
- **Components**:
  - Controllers: ReportController, ReportExportController
  - Services: ReportService
  - Utilities: PDF export, Excel export

#### 9. Bulk Operations Module (v2.1.0)
- **Purpose**: Bulk CRUD operations
- **Components**:
  - Controllers: BulkController
  - Routes: BulkRoutes

#### 10. Dashboard Module
- **Purpose**: Role-based dashboards
- **Components**:
  - Controllers: DashboardController
  - Services: Per-role dashboard logic

---

### Frontend Modules

#### 1. Core Module
- **Purpose**: App-wide services and guards
- **Components**:
  - Services: AuthService, PermissionService, NavigationService
  - Guards: authGuard, roleGuard, permissionGuard
  - Interceptors: authInterceptor, errorInterceptor
  - Layout: TopNav, MobileNav, ResponsiveLayout

#### 2. Features Module
- **Purpose**: Feature-specific components
- **Sub-modules**:
  - Auth: Login, Register
  - Dashboards: 6 role-based dashboards
  - Timesheets: Weekly grid, History
  - Leaves: Leave management
  - Documents: Document management
  - Approvals: Approval workflows
  - Admin: User management, Role management, Settings, Projects
  - HR: Employee management, HR documents
  - Supervisor: Team management, Reports
  - Employer: Workforce, Financial, Analytics

#### 3. Shared Module
- **Purpose**: Reusable components and utilities
- **Components**:
  - UI: ConfirmDialog, LoadingSpinner, StatsCard, ToastNotification
  - Utilities: Validators, ResponseHandler, DateHelper

#### 4. Services Module
- **Purpose**: Feature services (API communication)
- **Services**:
  - UserService, TimesheetService, LeaveService
  - DocumentService, NotificationService
  - ProjectService, ReportService
  - DashboardService, SettingsService

---

## 🔐 Security Design

### Authentication Flow
```
1. User submits credentials
2. Backend validates credentials
3. Backend generates JWT tokens (access + refresh)
4. Frontend stores tokens
5. Frontend includes token in all requests
6. Backend validates token on each request
7. Backend checks tenant context
8. Backend checks permissions
```

### Authorization Layers
```
Layer 1: Authentication (JWT validation)
   ↓
Layer 2: Tenant Validation (multi-tenant isolation)
   ↓
Layer 3: Permission Check (permission-based access)
   ↓
Layer 4: Ownership Validation (resource ownership)
```

### Multi-Tenant Isolation
```typescript
// Every request validates tenant context
if (!RequestValidator.validateTenantContext(req, res)) return;

// Every query includes tenantId
const query = { 
  tenantId: req.user.tenantId,
  // ... other filters
};

// Ownership validation
if (!RequestValidator.validateTenantOwnership(
  resource.tenantId, 
  req.user.tenantId
)) {
  return ApiResponse.forbidden(res);
}
```

---

## 📊 Data Flow Design

### API Request Flow (Backend)
```
Request
  ↓
1. CORS & Security Headers (helmet)
  ↓
2. Body Parser
  ↓
3. Authentication Middleware (JWT validation)
  ↓
4. Authorization Middleware (role/permission check)
  ↓
5. Validation Middleware (express-validator)
  ↓
6. Controller (request handling)
  ↓
7. Service (business logic)
  ↓
8. Model (database operation)
  ↓
9. DTO (data transformation)
  ↓
10. Response (standardized IApiResponse)
```

### API Response Format
```typescript
{
  status: 'success' | 'error',
  message?: string,
  data?: T,
  errors?: string[],
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
    totalPages?: number
  }
}
```

### Frontend Service Flow
```
Component
  ↓
Service.method()
  ↓
HttpClient (with interceptors)
  ↓
Auth Interceptor (add token)
  ↓
HTTP Request to Backend
  ↓
Response
  ↓
Error Interceptor (handle errors)
  ↓
Service Observable
  ↓
Component.subscribe({
  next: (response) => {
    if (response.status === 'success') {
      // Use response.data
    }
  },
  error: (error) => {
    // Error already handled by interceptor
    // Show toast notification
  }
})
```

---

## 🗂️ Database Design

### Collections
1. **tenants** - Organization information
2. **users** - User accounts (multi-tenant)
3. **timesheetentries** - Timesheet records
4. **leaverequests** - Leave requests
5. **documents** - Document metadata
6. **notifications** - User notifications
7. **projects** - Project definitions

### Indexes
- All collections indexed by `tenantId`
- Compound indexes for common queries
- Unique indexes for business constraints

### Data Relationships
```
Tenant (1) ──→ (N) Users
User (1) ──→ (N) TimesheetEntries
User (1) ──→ (N) LeaveRequests
User (1) ──→ (N) Documents
User (1) ──→ (N) Notifications
Tenant (1) ──→ (N) Projects
User (reportingTo) ──→ (N) Team Members
```

---

## 🎨 UI/UX Design

### Material Design System
- Angular Material components
- Consistent color scheme
- Responsive layouts
- Dark/Light mode support

### Responsive Design
- Mobile-first approach
- Breakpoints: 600px, 960px, 1280px
- Mobile navigation drawer
- Adaptive layouts

### User Feedback
- Toast notifications (success/error/warning/info)
- Loading spinners
- Progress indicators
- Error messages
- Confirmation dialogs

---

## 🔄 State Management

### Backend State
- **Stateless**: Each request is independent
- **JWT Tokens**: Carry user context
- **Session**: Managed via refresh tokens

### Frontend State
- **Signals**: Reactive state (Angular 18)
- **BehaviorSubjects**: Observable state
- **Local Storage**: Token persistence
- **Services**: Shared state

---

## 🛠️ Development Workflow

### Backend Development
```bash
1. Create Model (schema & validation)
2. Create Service (business logic)
3. Create DTO (data transformation)
4. Create Controller (request handling)
5. Create Routes (endpoint definition)
6. Add Middleware (auth/permission)
7. Test with Postman/curl
```

### Frontend Development
```bash
1. Create Service (API communication)
2. Create Component (UI)
3. Add Route (navigation)
4. Add Guard (protection)
5. Style with Material Design
6. Test in browser
```

### Adding New Feature
```bash
1. Define types in shared/types/
2. Add request/response interfaces
3. Create backend model
4. Create backend service
5. Create backend controller
6. Add backend routes
7. Create backend DTOs
8. Create frontend service
9. Create frontend component
10. Add frontend route
```

---

## 📐 Design Patterns

### Backend Patterns
- **MVC**: Model-View-Controller
- **Service Layer**: Business logic separation
- **DTO Pattern**: Data transformation
- **Middleware Chain**: Request processing
- **Repository Pattern**: Data access abstraction

### Frontend Patterns
- **Component-Service**: Separation of UI and logic
- **Observable Pattern**: Reactive programming (RxJS)
- **Guard Pattern**: Route protection
- **Interceptor Pattern**: HTTP manipulation
- **Dependency Injection**: Angular DI

### Shared Patterns
- **Single Source of Truth**: Shared types
- **DRY**: Reusable utilities
- **Convention over Configuration**: Standardized structure

---

## 🎯 Code Organization

### Naming Conventions
```
Backend:
- Models: user.model.ts (singular, PascalCase export)
- Controllers: user.controller.ts (UserController class)
- Services: user.service.ts (UserService class)
- Routes: user.routes.ts (lowercase)
- DTOs: user.dto.ts (toUserResponse function)

Frontend:
- Components: user-management.component.ts (kebab-case)
- Services: user.service.ts (UserService class)
- Models: user.model.ts (User interface)
- Guards: auth.guard.ts (authGuard function)

Shared:
- Types: index.ts (enums, interfaces)
- Constants: constants.ts (UPPERCASE_CONSTANTS)
- Utils: formatters.ts (formatX functions)
```

### Import Aliases
```typescript
// Backend
import { User } from '../models';
import { ApiResponse } from '@utils';
import { UserRole } from '@shared/types';

// Frontend
import { UserService } from '@app/services';
import { DateHelper } from '@shared/utils';
import { UserRole } from '@shared/types';
```

---

## 🔌 Integration Points

### Frontend ↔ Backend
- **Communication**: HTTP REST API
- **Format**: JSON
- **Authentication**: JWT Bearer token
- **Error Handling**: Standardized error responses

### Backend ↔ Database
- **ORM**: Mongoose
- **Schema Validation**: Model level
- **Indexing**: Performance optimization
- **Transactions**: Where needed

### Backend ↔ Email
- **Service**: Nodemailer
- **Provider**: Gmail/SMTP
- **Templates**: HTML emails
- **Async**: Non-blocking

---

## 📊 Performance Design

### Backend Optimization
- Database indexing
- Query optimization
- Pagination for large datasets
- Efficient aggregations
- Cached token validation

### Frontend Optimization
- Lazy loading routes
- OnPush change detection
- Reactive forms
- Optimized Material components
- Bundle optimization

---

## 🧪 Testing Strategy

### Backend Testing
- Unit tests: Services & utilities
- Integration tests: Controllers
- API tests: End-to-end
- Validation tests: Middleware

### Frontend Testing
- Unit tests: Services & utilities
- Component tests: UI components
- Integration tests: User flows
- E2E tests: Critical paths

---

## 🔄 Workflow Design

### Timesheet Approval Workflow
```
1. Employee creates entries (DRAFT)
2. Employee submits week (SUBMITTED)
3. Supervisor/HR reviews
4. Approve → APPROVED (email sent)
   OR
   Reject → REJECTED (email sent with reason)
5. Employee can edit rejected entries
```

### Leave Approval Workflow
```
1. Employee requests leave (PENDING)
2. System checks balance
3. Supervisor/HR reviews
4. Approve → APPROVED (balance deducted, email sent)
   OR
   Reject → REJECTED (email sent with reason)
5. Employee can cancel approved leaves
```

---

## 🎨 UI Design System

### Color Scheme
- Primary: Material Blue
- Accent: Material Orange
- Warn: Material Red
- Background: Adaptive (light/dark mode)

### Component Library
- Material Design Components
- Custom Shared Components:
  - ConfirmDialog
  - LoadingSpinner
  - StatsCard
  - ToastNotification
  - NotificationDropdown

### Layout System
- Responsive layout component
- Top navigation
- Mobile navigation drawer
- Content area with padding

---

## 🔐 Permission Design

### Permission Hierarchy
```
PROSPECT (Lowest)
  ↓ (inherits + adds)
EMPLOYEE
  ↓ (inherits + adds)
SUPERVISOR
  ↓ (inherits + adds)
HR
  ↓ (inherits + adds)
ADMIN
  ↓ (separate branch)
EMPLOYER (Highest - different permissions)
```

### Permission Categories
1. **Document Permissions**: Upload, view, delete
2. **Timesheet Permissions**: Submit, approve
3. **Leave Permissions**: Request, approve
4. **User Management**: Create, edit, delete
5. **Reports**: View team, org, financial
6. **System**: Manage settings, organization

---

## 📡 API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods: GET, POST, PUT, DELETE
- Status codes: 200, 201, 400, 401, 403, 404, 500
- Consistent response format

### Endpoint Naming
```
/api/v1/resource          → GET all, POST create
/api/v1/resource/:id      → GET one, PUT update, DELETE remove
/api/v1/resource/action   → POST action (non-CRUD)
/api/v1/resource/custom   → GET custom query
```

### Versioning
- URL versioning: `/api/v1/`
- Backward compatibility maintained
- Breaking changes require new version

---

## 🌐 Deployment Design

### Environment Configuration
- **Development**: Local MongoDB, debug logging
- **Staging**: Cloud MongoDB, error logging
- **Production**: Optimized builds, minimal logging

### Build Process
```
Backend:
1. TypeScript compilation (tsc)
2. Output to dist/
3. Copy .env
4. Run with node dist/server.js

Frontend:
1. Angular build (ng build)
2. Output to dist/frontend/
3. Serve static files or SSR
```

---

## 🎯 Future Scalability

### Designed For
- ✅ Adding new roles
- ✅ Adding new permissions
- ✅ Adding new modules
- ✅ Multiple tenants
- ✅ High user counts
- ✅ Large datasets

### Extensibility Points
- Shared types (easy to extend)
- Permission system (add permissions easily)
- Role configuration (add roles easily)
- Utilities (add functions easily)
- Components (create new easily)

---

## 📚 Best Practices Enforced

### Code Quality
- TypeScript strict mode
- ESLint rules
- Consistent formatting
- JSDoc comments
- No console.logs in production

### Security
- Input validation
- Output sanitization
- SQL injection prevention (Mongoose)
- XSS prevention
- CSRF protection (where needed)
- Rate limiting (optional)

### Performance
- Database indexing
- Efficient queries
- Pagination
- Lazy loading
- Code splitting

---

## 🔄 Version History

### v2.1.0 (Current)
- Comprehensive refactoring
- 5 new feature systems
- Utilities applied throughout
- DayJs integration
- 0 TypeScript errors

### v2.0.0
- Permission-based authorization
- Role configuration system
- Shared types architecture

### v1.0.0
- Initial release
- Basic features
- Role-based access

---

**Document Version**: 2.1.0  
**Status**: Current  
**Last Updated**: November 12, 2025

