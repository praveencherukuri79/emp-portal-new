# Application Structure & API Type Safety Guide

## Table of Contents
1. [Application Overview](#application-overview)
2. [Shared Folder Structure](#shared-folder-structure)
3. [Type System Architecture](#type-system-architecture)
4. [Enums Usage Guide](#enums-usage-guide)
5. [Interfaces Usage Guide](#interfaces-usage-guide)
6. [API Request/Response Pattern](#api-requestresponse-pattern)
7. [DTO (Data Transfer Object) Pattern](#dto-data-transfer-object-pattern)
8. [Backend Implementation Guide](#backend-implementation-guide)
9. [Frontend Implementation Guide](#frontend-implementation-guide)
10. [Best Practices](#best-practices)
11. [Common Patterns](#common-patterns)

---

## Application Overview

This is a **multi-tenant employee portal** application with:
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose)
- **Frontend**: Angular + TypeScript
- **Shared Types**: TypeScript types, interfaces, and enums shared between frontend and backend

### Key Principles
1. **Type Safety**: All APIs are fully type-safe using shared types
2. **Single Source of Truth**: Types defined once in `shared/` folder, used by both frontend and backend
3. **DTO Pattern**: Database models are converted to API response types using DTOs
4. **Consistent API Responses**: All APIs return `IApiResponse<T>` format

---

## Shared Folder Structure

```
shared/
├── types/
│   ├── index.ts          # Main types file (enums, base interfaces, DTOs)
│   ├── requests.ts       # Request body interfaces
│   ├── responses.ts      # Response body interfaces
│   └── constants.ts      # API endpoints, default values, labels
└── utils/
    └── formatters.ts     # Shared utility functions
```

### File Responsibilities

#### `shared/types/index.ts`
- **Purpose**: Core types, enums, and base interfaces
- **Contains**:
  - All enums (UserRole, LeaveType, TimesheetStatus, etc.)
  - Base interfaces (IAddress, ISalary, IVisa, ILeaveBalance)
  - DTO interfaces (IRegisterDTO, ILoginDTO, ITimesheetEntryDTO)
  - Approval interfaces
  - Employer analytics interfaces
  - `IApiResponse<T>` and `IPaginatedResponse<T>`
- **Import**: `import { UserRole, LeaveType, IApiResponse } from '@shared/types'`

#### `shared/types/requests.ts`
- **Purpose**: Request body interfaces for API endpoints
- **Contains**: All interfaces for request bodies (IUpdateProfileRequest, ICreateUserRequest, etc.)
- **Import**: `import { IUpdateProfileRequest } from '@shared/types/requests'`

#### `shared/types/responses.ts`
- **Purpose**: Response body interfaces for API endpoints
- **Contains**: All interfaces for response data (IUserResponse, ITimesheetEntryResponse, etc.)
- **Import**: `import { IUserResponse, ILoginResponse } from '@shared/types/responses'`

#### `shared/types/constants.ts`
- **Purpose**: API endpoints, default values, and UI labels
- **Contains**:
  - `API_ENDPOINTS` - All API endpoint paths
  - `DEFAULT_VALUES` - Default pagination, leave balances, etc.
  - `STATUS_LABELS`, `PRIORITY_LABELS`, etc. - UI display labels
- **Import**: `import { API_ENDPOINTS, DEFAULT_VALUES } from '@shared/types/constants'`

---

## Type System Architecture

### Type Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED TYPES FOLDER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   index.ts   │  │  requests.ts │  │ responses.ts │      │
│  │  (Enums,     │  │  (Request    │  │  (Response  │      │
│  │   Base       │  │   Bodies)    │  │   Bodies)   │      │
│  │   Types)     │  │              │  │             │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    BACKEND      │  │    BACKEND      │  │    BACKEND      │
│  Controllers    │  │     DTOs        │  │   Services      │
│  (Use requests) │  │  (Convert to    │  │  (Use enums)    │
│                 │  │   responses)    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  API Response    │
                    │  IApiResponse<T> │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │  Components  │  │    Models   │      │
│  │  (Use        │  │  (Use        │  │  (Use       │      │
│  │   responses) │  │   enums)     │  │   responses)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Enums Usage Guide

### Available Enums

All enums are defined in `shared/types/index.ts`:

```typescript
export enum UserRole {
  PROSPECT = 'prospect',
  EMPLOYEE = 'employee',
  SUPERVISOR = 'supervisor',
  HR = 'hr',
  ADMIN = 'admin',
  EMPLOYER = 'employer'
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity'
}

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// ... and more
```

### Importing Enums

**Backend:**
```typescript
import { UserRole, LeaveType, TimesheetStatus } from '@shared/types';
// or
import { UserRole, LeaveType, TimesheetStatus } from '../types'; // if using relative path
```

**Frontend:**
```typescript
import { UserRole, LeaveType, TimesheetStatus } from '@shared/types';
```

### Using Enums in Code

**Backend Controller:**
```typescript
import { UserRole } from '@shared/types';

// In authorization middleware
if (req.user?.role === UserRole.ADMIN) {
  // Allow access
}

// In query
const users = await User.find({ role: UserRole.EMPLOYEE });
```

**Backend Model:**
```typescript
import { UserRole, EmploymentType } from '@shared/types';

const userSchema = new Schema({
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  employmentType: {
    type: String,
    enum: Object.values(EmploymentType)
  }
});
```

**Frontend Service:**
```typescript
import { UserRole } from '@shared/types';

getUsersByRole(role: UserRole): Observable<IApiResponse<IUsersListResponse>> {
  return this.http.get<IApiResponse<IUsersListResponse>>(
    `${this.baseUrl}?role=${role}`
  );
}
```

**Frontend Component:**
```typescript
import { UserRole, LeaveType } from '@shared/types';

export class UserComponent {
  roles = Object.values(UserRole);
  selectedRole = UserRole.EMPLOYEE;
  
  getRoleLabel(role: UserRole): string {
    return ROLE_LABELS[role] || role;
  }
}
```

### Important Notes on Enums

1. **Enum Values are Strings**: All enum values are lowercase strings (e.g., `'employee'`, not `'Employee'`)
2. **Use Enum Values in Database**: Store enum values (strings) in database, not enum keys
3. **Type Safety**: Always use enum types in function parameters and return types
4. **UI Labels**: Use `constants.ts` for display labels (e.g., `ROLE_LABELS[UserRole.EMPLOYEE]`)

---

## Interfaces Usage Guide

### Interface Categories

#### 1. Request Interfaces (`shared/types/requests.ts`)

Used for API request bodies:

```typescript
export interface IUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  phone?: string;
  avatar?: string;
  address?: IAddress;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  department?: string;
  // ... more fields
}
```

**Usage in Backend Controller:**
```typescript
import { IUpdateProfileRequest } from '@shared/types/requests';

static async updateProfile(req: IAuthRequest, res: Response) {
  const data: IUpdateProfileRequest = req.body;
  // Use data with full type safety
}
```

**Usage in Frontend Service:**
```typescript
import { IUpdateProfileRequest } from '@shared/types/requests';

updateProfile(data: IUpdateProfileRequest): Observable<IApiResponse<IUserResponse>> {
  return this.http.put<IApiResponse<IUserResponse>>(
    `${environment.apiUrl}${API_ENDPOINTS.USERS.PROFILE}`,
    data
  );
}
```

#### 2. Response Interfaces (`shared/types/responses.ts`)

Used for API response data:

```typescript
export interface IUserResponse {
  _id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  // ... more fields
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ILoginResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
}
```

**Usage in Backend Controller:**
```typescript
import { IUserResponse } from '@shared/types/responses';
import { toUserResponse } from '../dto';

static async getProfile(req: IAuthRequest, res: Response) {
  const user = await User.findById(req.user?.userId);
  const responseData: IUserResponse = toUserResponse(user);
  return ApiResponse.success<IUserResponse>(res, responseData, 'Profile retrieved');
}
```

**Usage in Frontend Service:**
```typescript
import { IUserResponse } from '@shared/types/responses';

getProfile(): Observable<IApiResponse<IUserResponse>> {
  return this.http.get<IApiResponse<IUserResponse>>(
    `${environment.apiUrl}${API_ENDPOINTS.USERS.PROFILE}`
  );
}
```

#### 3. Base Interfaces (`shared/types/index.ts`)

Used for nested structures:

```typescript
export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ILeaveBalance {
  annual: number;
  sick: number;
  personal: number;
  unpaid: number;
  maternity: number;
  paternity: number;
}
```

**Usage:**
```typescript
import { IAddress, ILeaveBalance } from '@shared/types';

// Use in request/response interfaces
export interface IUpdateProfileRequest {
  address?: IAddress;
}

export interface ILeaveBalanceResponse extends ILeaveBalance {
  // Additional fields
}
```

### API Response Wrapper

All API responses follow this structure:

```typescript
export interface IApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

**Example Response:**
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "_id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee"
  }
}
```

---

## API Request/Response Pattern

### Complete Flow Example

#### 1. Define Request Interface (`shared/types/requests.ts`)

```typescript
export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  department?: string;
  designation?: string;
}
```

#### 2. Define Response Interface (`shared/types/responses.ts`)

```typescript
export interface IUserResponse {
  _id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

#### 3. Backend Controller Implementation

```typescript
import { Response } from 'express';
import { IAuthRequest } from '../types';
import { ICreateUserRequest } from '@shared/types/requests';
import { IUserResponse } from '@shared/types/responses';
import { ApiResponse } from '../utils/response.util';
import { toUserResponse } from '../dto';
import { User } from '../models';

export class UserController {
  static async createUser(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      // 1. Type the request body
      const userData: ICreateUserRequest = req.body;
      
      // 2. Create user in database
      const user = new User(userData);
      await user.save();
      
      // 3. Convert to response type using DTO
      const responseData: IUserResponse = toUserResponse(user);
      
      // 4. Return typed response
      return ApiResponse.created<IUserResponse>(
        res,
        responseData,
        'User created successfully'
      );
    } catch (error) {
      return ApiResponse.error(res, 'Failed to create user');
    }
  }
}
```

#### 4. Frontend Service Implementation

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICreateUserRequest } from '@shared/types/requests';
import { IUserResponse } from '@shared/types/responses';
import { IApiResponse } from '@shared/types';
import { API_ENDPOINTS } from '@shared/types/constants';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  createUser(userData: ICreateUserRequest): Observable<IApiResponse<IUserResponse>> {
    return this.http.post<IApiResponse<IUserResponse>>(
      `${environment.apiUrl}${API_ENDPOINTS.USERS.ALL}`,
      userData
    );
  }
}
```

#### 5. Frontend Component Usage

```typescript
import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { ICreateUserRequest, UserRole } from '@shared/types';
import { IUserResponse } from '@shared/types/responses';

export class CreateUserComponent {
  private userService = inject(UserService);
  
  createUser() {
    const userData: ICreateUserRequest = {
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.EMPLOYEE
    };
    
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const user: IUserResponse = response.data;
          console.log('User created:', user);
        }
      },
      error: (error) => {
        console.error('Error creating user:', error);
      }
    });
  }
}
```

---

## DTO (Data Transfer Object) Pattern

### Purpose

DTOs convert database models (Mongoose documents) to API response types. This:
- Keeps controllers clean
- Ensures type safety
- Handles field name mapping (e.g., `phone` → `phoneNumber`)
- Converts ObjectIds to strings

### DTO Structure

**Location**: `backend/src/dto/`

**Example DTO** (`backend/src/dto/user.dto.ts`):

```typescript
import { IUserResponse, IUsersListResponse } from '@shared/types/responses';
import { User } from '../models';
import { IUser } from '../types';
import { Document } from 'mongoose';

/**
 * Convert User model to IUserResponse
 */
export function toUserResponse(user: Document & IUser): IUserResponse {
  return {
    _id: String(user._id),
    tenantId: String(user.tenantId),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    designation: user.designation,
    phoneNumber: user.phone, // Map phone → phoneNumber
    dateOfJoining: user.joiningDate, // Map joiningDate → dateOfJoining
    employmentType: user.employmentType,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * Convert array of User models to IUsersListResponse
 */
export function toUsersListResponse(
  users: (Document & IUser)[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }
): IUsersListResponse {
  return {
    users: users.map(toUserResponse),
    pagination
  };
}
```

### Using DTOs in Controllers

```typescript
import { toUserResponse, toUsersListResponse } from '../dto';

// Single user
const user = await User.findById(userId);
const responseData = toUserResponse(user);
return ApiResponse.success<IUserResponse>(res, responseData);

// List of users
const users = await User.find(query);
const responseData = toUsersListResponse(users, pagination);
return ApiResponse.success<IUsersListResponse>(res, responseData);
```

### DTO Export Pattern

All DTOs are exported from `backend/src/dto/index.ts`:

```typescript
export * from './auth.dto';
export * from './user.dto';
export * from './timesheet.dto';
// ... etc
```

**Import:**
```typescript
import { toUserResponse, toLoginResponse } from '../dto';
```

---

## Backend Implementation Guide

### Project Structure

```
backend/src/
├── controllers/     # API route handlers
├── dto/            # Data Transfer Objects (model → response conversion)
├── middleware/     # Auth, authorization, validation
├── models/         # Mongoose models
├── routes/         # Express route definitions
├── services/       # Business logic
├── types/          # Backend-specific types
└── utils/          # Utility functions (ApiResponse, etc.)
```

### Controller Pattern

```typescript
import { Response } from 'express';
import { IAuthRequest } from '../types';
import { ICreateUserRequest } from '@shared/types/requests';
import { IUserResponse } from '@shared/types/responses';
import { ApiResponse } from '../utils/response.util';
import { toUserResponse } from '../dto';
import { User } from '../models';

export class UserController {
  static async createUser(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      // 1. Type request body
      const userData: ICreateUserRequest = req.body;
      
      // 2. Business logic (or call service)
      const user = new User(userData);
      await user.save();
      
      // 3. Convert to response using DTO
      const responseData: IUserResponse = toUserResponse(user);
      
      // 4. Return typed response
      return ApiResponse.created<IUserResponse>(
        res,
        responseData,
        'User created successfully'
      );
    } catch (error) {
      return ApiResponse.error(res, 'Failed to create user');
    }
  }
}
```

### Key Points

1. **Always type request body**: Use interfaces from `@shared/types/requests`
2. **Always use DTOs**: Convert models to response types using DTO functions
3. **Always type responses**: Use `ApiResponse.success<T>()` with explicit type
4. **Import from shared**: Use `@shared/types/*` path alias

### TypeScript Path Aliases

Configured in `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

---

## Frontend Implementation Guide

### Project Structure

```
frontend/src/app/
├── core/
│   ├── models/        # Frontend models (may extend response interfaces)
│   ├── services/      # Core services (auth, etc.)
│   └── layout/        # Layout components
├── features/          # Feature modules
└── services/          # Feature services
```

### Service Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICreateUserRequest } from '@shared/types/requests';
import { IUserResponse, IUsersListResponse } from '@shared/types/responses';
import { IApiResponse } from '@shared/types';
import { API_ENDPOINTS } from '@shared/types/constants';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.USERS.ALL}`;

  createUser(userData: ICreateUserRequest): Observable<IApiResponse<IUserResponse>> {
    return this.http.post<IApiResponse<IUserResponse>>(this.baseUrl, userData);
  }

  getAllUsers(params?: { role?: string }): Observable<IApiResponse<IUsersListResponse>> {
    let httpParams = new HttpParams();
    if (params?.role) httpParams = httpParams.set('role', params.role);
    return this.http.get<IApiResponse<IUsersListResponse>>(this.baseUrl, { params: httpParams });
  }
}
```

### Component Pattern

```typescript
import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { ICreateUserRequest, UserRole } from '@shared/types';
import { IUserResponse } from '@shared/types/responses';

export class CreateUserComponent {
  private userService = inject(UserService);
  
  userData: ICreateUserRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.EMPLOYEE
  };
  
  createUser() {
    this.userService.createUser(this.userData).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const user: IUserResponse = response.data;
          // Handle success
        }
      },
      error: (error) => {
        // Handle error
      }
    });
  }
}
```

### TypeScript Path Aliases

Configured in `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

---

## Best Practices

### 1. Always Use Shared Types

✅ **DO:**
```typescript
import { UserRole, IUserResponse } from '@shared/types';
```

❌ **DON'T:**
```typescript
// Don't define types locally
interface User {
  role: string; // Should use UserRole enum
}
```

### 2. Always Type API Responses

✅ **DO:**
```typescript
return ApiResponse.success<IUserResponse>(res, responseData);
```

❌ **DON'T:**
```typescript
return ApiResponse.success(res, responseData); // Missing type
```

### 3. Always Use DTOs for Responses

✅ **DO:**
```typescript
const responseData = toUserResponse(user);
return ApiResponse.success<IUserResponse>(res, responseData);
```

❌ **DON'T:**
```typescript
// Don't return model directly
return ApiResponse.success(res, user);
```

### 4. Always Use Request Interfaces

✅ **DO:**
```typescript
const data: ICreateUserRequest = req.body;
```

❌ **DON'T:**
```typescript
const data = req.body; // No type safety
```

### 5. Use Enums, Not Strings

✅ **DO:**
```typescript
if (user.role === UserRole.ADMIN) { }
```

❌ **DON'T:**
```typescript
if (user.role === 'admin') { } // Magic string
```

### 6. Use Constants for API Endpoints

✅ **DO:**
```typescript
import { API_ENDPOINTS } from '@shared/types/constants';
const url = `${baseUrl}${API_ENDPOINTS.USERS.ALL}`;
```

❌ **DON'T:**
```typescript
const url = `${baseUrl}/users`; // Hardcoded string
```

### 7. Handle Response Status

✅ **DO:**
```typescript
this.service.getData().subscribe({
  next: (response) => {
    if (response.status === 'success' && response.data) {
      // Use response.data
    }
  }
});
```

### 8. Use Type Guards When Needed

```typescript
function isSuccessResponse<T>(response: IApiResponse<T>): response is IApiResponse<T> & { data: T } {
  return response.status === 'success' && response.data !== undefined;
}

// Usage
if (isSuccessResponse(response)) {
  // TypeScript knows response.data exists
  console.log(response.data);
}
```

---

## Common Patterns

### Pattern 1: Create Resource

**Request Interface:**
```typescript
// shared/types/requests.ts
export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}
```

**Response Interface:**
```typescript
// shared/types/responses.ts
export interface IUserResponse {
  _id: string;
  email: string;
  // ... more fields
}
```

**Backend:**
```typescript
static async createUser(req: IAuthRequest, res: Response) {
  const data: ICreateUserRequest = req.body;
  const user = new User(data);
  await user.save();
  const responseData = toUserResponse(user);
  return ApiResponse.created<IUserResponse>(res, responseData);
}
```

**Frontend:**
```typescript
createUser(data: ICreateUserRequest): Observable<IApiResponse<IUserResponse>> {
  return this.http.post<IApiResponse<IUserResponse>>(this.url, data);
}
```

### Pattern 2: Update Resource

**Request Interface:**
```typescript
export interface IUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  // ... optional fields
}
```

**Backend:**
```typescript
static async updateProfile(req: IAuthRequest, res: Response) {
  const data: IUpdateProfileRequest = req.body;
  const user = await User.findByIdAndUpdate(req.user?.userId, data, { new: true });
  const responseData = toUserResponse(user);
  return ApiResponse.success<IUserResponse>(res, responseData);
}
```

### Pattern 3: List with Pagination

**Response Interface:**
```typescript
export interface IUsersListResponse {
  users: IUserResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

**Backend:**
```typescript
static async getAllUsers(req: IAuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const users = await User.find().skip(skip).limit(limit);
  const total = await User.countDocuments();
  
  const responseData = toUsersListResponse(users, {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: limit
  });
  
  return ApiResponse.success<IUsersListResponse>(res, responseData);
}
```

**Frontend:**
```typescript
getAllUsers(page: number = 1, limit: number = 10): Observable<IApiResponse<IUsersListResponse>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());
  return this.http.get<IApiResponse<IUsersListResponse>>(this.url, { params });
}
```

### Pattern 4: Filter/Query Parameters

**Backend:**
```typescript
static async getAllUsers(req: IAuthRequest, res: Response) {
  const { role, isActive } = req.query;
  const query: any = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  
  const users = await User.find(query);
  const responseData = toUsersListResponse(users, pagination);
  return ApiResponse.success<IUsersListResponse>(res, responseData);
}
```

**Frontend:**
```typescript
getAllUsers(filters?: { role?: UserRole; isActive?: boolean }): Observable<IApiResponse<IUsersListResponse>> {
  let params = new HttpParams();
  if (filters?.role) params = params.set('role', filters.role);
  if (filters?.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
  return this.http.get<IApiResponse<IUsersListResponse>>(this.url, { params });
}
```

---

## Summary Checklist

When creating a new API endpoint:

- [ ] Define request interface in `shared/types/requests.ts`
- [ ] Define response interface in `shared/types/responses.ts`
- [ ] Create DTO function in `backend/src/dto/` to convert model to response
- [ ] Use request interface in controller to type `req.body`
- [ ] Use DTO function to convert model to response type
- [ ] Return `ApiResponse.success<T>()` with explicit type
- [ ] Use response interface in frontend service return type
- [ ] Use request interface in frontend service method parameter
- [ ] Check `response.status === 'success'` before using `response.data`
- [ ] Use enums instead of strings for type-safe values
- [ ] Use `API_ENDPOINTS` constants instead of hardcoded strings

---

## Quick Reference

### Import Paths

**Backend:**
```typescript
import { UserRole, LeaveType } from '@shared/types';
import { ICreateUserRequest } from '@shared/types/requests';
import { IUserResponse } from '@shared/types/responses';
import { API_ENDPOINTS } from '@shared/types/constants';
```

**Frontend:**
```typescript
import { UserRole, LeaveType } from '@shared/types';
import { ICreateUserRequest } from '@shared/types/requests';
import { IUserResponse } from '@shared/types/responses';
import { API_ENDPOINTS } from '@shared/types/constants';
```

### Response Format

```typescript
// Success
{
  status: 'success',
  message: 'Operation successful',
  data: { /* response data */ }
}

// Error
{
  status: 'error',
  message: 'Error message',
  errors?: ['Error 1', 'Error 2']
}
```

### Common Enums

- `UserRole`: PROSPECT, EMPLOYEE, SUPERVISOR, HR, ADMIN, EMPLOYER
- `LeaveType`: ANNUAL, SICK, PERSONAL, UNPAID, MATERNITY, PATERNITY
- `TimesheetStatus`: DRAFT, SUBMITTED, APPROVED, REJECTED
- `LeaveStatus`: PENDING, APPROVED, REJECTED, CANCELLED
- `EmploymentType`: FULL_TIME, PART_TIME, CONTRACT, INTERN

---

**Last Updated**: 2025-01-12
**Version**: 1.0.0

