# Reusable Components Refactoring Plan

## Problem Analysis
Three components display user/employee data with significant duplication:

### 1. Admin - User Management
- **Columns**: name, email, role, department, status, actions
- **Data Source**: `UserService.getAllUsers()`
- **Actions**: Edit role, toggle status, create user
- **Filters**: Role filter
- **View All**: All user types

### 2. HR - Employee Management  
- **Columns**: name, employeeId, department, role, status, actions
- **Data Source**: `UserService.getAllUsers({ role: 'employee' })`
- **Actions**: View (dialog), Edit (dialog)
- **Filters**: Status filter
- **View**: Employees only

### 3. Employer - Workforce/Team Directory
- **Columns**: name, department, role, employmentType, tenure, status, actions
- **Data Source**: `EmployerService.getWorkforceOverview()`
- **Actions**: View, Edit (currently placeholder)
- **Filters**: None (implicit by employer)
- **View**: Employer's workforce

## Common Patterns
✅ Signal-based reactive state
✅ Mat-table display
✅ Search functionality
✅ Loading/error states
✅ Avatar with initials
✅ Status chips
✅ Action buttons (view/edit)

## Solution: Reusable Employee/User Table Component

### Component Architecture

```typescript
// shared/components/user-table/user-table.component.ts
@Component({
  selector: 'app-user-table',
  standalone: true
})
export class UserTableComponent {
  // Configuration Inputs
  @Input() columns: UserTableColumn[] = [];
  @Input() dataSource: User[] | IEmployerWorkforceEmployee[] = [];
  @Input() loading = false;
  @Input() searchable = true;
  @Input() permissions: UserTablePermissions = {};
  
  // Action Outputs
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() statusToggle = new EventEmitter<any>();
  @Output() roleChange = new EventEmitter<any>();
}
```

### Column Configuration Interface

```typescript
interface UserTableColumn {
  id: string;                    // 'name' | 'email' | 'role' | 'department' | 'employeeId' | 'tenure' | 'status' | 'actions'
  label: string;                 // Display label
  visible: boolean;              // Show/hide
  sortable?: boolean;            // Enable sorting
  customTemplate?: TemplateRef;  // Custom cell template
}
```

### Permission Configuration

```typescript
interface UserTablePermissions {
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canChangeRole?: boolean;
  canToggleStatus?: boolean;
  canCreate?: boolean;
}
```

### Integration with PermissionService

```typescript
export class UserTableComponent {
  private permissionService = inject(PermissionService);
  
  ngOnInit() {
    // Auto-configure permissions based on user role
    this.configurePermissions();
  }
  
  private configurePermissions() {
    const userRole = this.permissionService.getCurrentUserRole();
    
    // Override permissions based on role if not explicitly provided
    if (!this.permissions.canEdit && this.permissionService.canAccessRoute('/admin/users')) {
      this.permissions.canEdit = true;
    }
    // ... more permission logic
  }
}
```

## Implementation Steps

### Phase 1: Create Reusable Component
1. ✅ Create `UserTableComponent` with all configuration options
2. ✅ Implement column rendering with dynamic templates
3. ✅ Add search/filter functionality
4. ✅ Integrate PermissionService for role-based visibility
5. ✅ Create action handlers with event emitters
6. ✅ Add loading/error state displays
7. ✅ Style with Material Design

### Phase 2: Refactor Admin User Management
1. ✅ Replace existing table with `<app-user-table>`
2. ✅ Configure columns for admin view
3. ✅ Wire up event handlers
4. ✅ Test role change, status toggle, create user

### Phase 3: Refactor HR Employee Management
1. ✅ Replace existing table with `<app-user-table>`
2. ✅ Configure columns for HR view
3. ✅ Wire up dialog handlers
4. ✅ Test view/edit functionality

### Phase 4: Refactor Employer Workforce
1. ✅ Replace existing table with `<app-user-table>`
2. ✅ Configure columns for employer view
3. ✅ Add tenure calculation to reusable component
4. ✅ Test workforce display

### Phase 5: Testing & Validation
1. ✅ Test with all three roles (Admin, HR, Employer)
2. ✅ Verify permission-based access
3. ✅ Check mobile responsiveness
4. ✅ Validate search/filter across all views

## Benefits

### Code Reduction
- **Before**: ~600 lines (3 components × 200 lines each)
- **After**: ~250 lines (1 reusable component) + ~50 lines per parent = ~400 lines
- **Savings**: ~200 lines (33% reduction)

### Maintainability
- ✅ Single source of truth for user table logic
- ✅ Consistent UI/UX across all roles
- ✅ Easier to add new columns/features
- ✅ Centralized permission logic

### Extensibility
- ✅ Easy to add new user types (Supervisor, Prospect, etc.)
- ✅ Column configuration can be saved per user
- ✅ Export functionality can be added once
- ✅ Bulk operations become trivial

## Future Enhancements
- [ ] Add sorting by column
- [ ] Add pagination
- [ ] Add column visibility toggle
- [ ] Add export to CSV/Excel
- [ ] Add bulk select/actions
- [ ] Save user preferences (column order, filters)
- [ ] Add advanced filters (date range, custom fields)

