# Admin API Documentation

## 🔒 Security

All admin endpoints require the `x-admin-secret` header with the value from `ADMIN_SECRET_KEY` in `.env`

**Important:** Keep this key secret and never commit it to version control!

---

## Endpoints

### 1. Create Single User

**Endpoint:** `POST /api/v1/admin/create-user`

**Headers:**
```
x-admin-secret: super-secure-admin-key-change-in-production-xyz789
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee",
  "employeeId": "EMP001",
  "department": "Engineering",
  "designation": "Senior Developer",
  "phone": "+1234567890",
  "dateOfJoining": "2024-01-15",
  "employmentType": "full-time"
}
```

**Required Fields:**
- `email`
- `password`
- `firstName`
- `lastName`
- `role`

**Optional Fields:**
- `employeeId` (auto-generated if not provided)
- `department` (default: "General")
- `designation` (default: "Employee")
- `phone`
- `dateOfJoining` (default: current date)
- `employmentType` (default: "full-time")

**Valid Roles:**
- `prospect`
- `employee`
- `supervisor`
- `hr`
- `admin`
- `employer`

**Valid Employment Types:**
- `full-time`
- `part-time`
- `contract`
- `intern`

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee",
      "tenantId": "..."
    },
    "tenant": {
      "id": "...",
      "name": "Default Organization",
      "domain": "default"
    }
  }
}
```

---

### 2. Bulk Create Users

**Endpoint:** `POST /api/v1/admin/bulk-create-users`

**Headers:**
```
x-admin-secret: super-secure-admin-key-change-in-production-xyz789
Content-Type: application/json
```

**Request Body:**
```json
{
  "users": [
    {
      "email": "user1@company.com",
      "password": "Pass123!",
      "firstName": "Alice",
      "lastName": "Smith",
      "role": "employee",
      "department": "HR"
    },
    {
      "email": "user2@company.com",
      "password": "Pass123!",
      "firstName": "Bob",
      "lastName": "Johnson",
      "role": "supervisor",
      "department": "Engineering"
    },
    {
      "email": "admin@company.com",
      "password": "AdminPass123!",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "department": "Management"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk user creation completed",
  "data": {
    "summary": {
      "total": 3,
      "created": 3,
      "failed": 0
    },
    "results": {
      "created": [...],
      "failed": []
    },
    "tenant": {
      "id": "...",
      "name": "Default Organization"
    }
  }
}
```

---

### 3. Get Tenant Info

**Endpoint:** `GET /api/v1/admin/tenant`

**Headers:**
```
x-admin-secret: super-secure-admin-key-change-in-production-xyz789
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "_id": "...",
    "name": "Default Organization",
    "domain": "default",
    "isActive": true,
    "settings": {
      "timezone": "UTC",
      "dateFormat": "MM/DD/YYYY",
      "currency": "USD"
    }
  }
}
```

---

### 4. Update Tenant

**Endpoint:** `PUT /api/v1/admin/tenant`

**Headers:**
```
x-admin-secret: super-secure-admin-key-change-in-production-xyz789
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Company Inc",
  "domain": "mycompany",
  "settings": {
    "timezone": "America/New_York",
    "dateFormat": "DD/MM/YYYY",
    "currency": "USD"
  }
}
```

---

## 📝 Example Usage with cURL

### Create Single User
```bash
curl -X POST http://localhost:5000/api/v1/admin/create-user \
  -H "x-admin-secret: super-secure-admin-key-change-in-production-xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "employee",
    "department": "IT"
  }'
```

### Create Admin User
```bash
curl -X POST http://localhost:5000/api/v1/admin/create-user \
  -H "x-admin-secret: super-secure-admin-key-change-in-production-xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!",
    "firstName": "System",
    "lastName": "Admin",
    "role": "admin",
    "department": "Management"
  }'
```

### Bulk Create Users
```bash
curl -X POST http://localhost:5000/api/v1/admin/bulk-create-users \
  -H "x-admin-secret: super-secure-admin-key-change-in-production-xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {
        "email": "emp1@company.com",
        "password": "Pass123!",
        "firstName": "Employee",
        "lastName": "One",
        "role": "employee"
      },
      {
        "email": "emp2@company.com",
        "password": "Pass123!",
        "firstName": "Employee",
        "lastName": "Two",
        "role": "employee"
      }
    ]
  }'
```

---

## 🔑 Key Features

1. **Automatic Tenant Assignment**
   - Users don't need to provide tenant ID
   - All users are automatically assigned to the default tenant
   - First API call creates default tenant if none exists

2. **Auto-Generated Fields**
   - Employee IDs are auto-generated if not provided
   - Email verification is automatically set to true
   - Users are set to active status by default

3. **Security**
   - Protected by secret key in headers
   - Passwords are automatically hashed
   - Sensitive fields removed from responses

4. **Default Tenant**
   - Automatically created on first user creation
   - Can be updated via admin API
   - Single organization setup for simplicity

---

## ⚠️ Important Notes

1. **Change the ADMIN_SECRET_KEY** in production!
2. **Never expose** this key in frontend code
3. **Use HTTPS** in production
4. Users created via admin API:
   - Are auto-verified (no email verification needed)
   - Are set to active status
   - Are assigned to the default tenant
5. After creating users, they can login normally via `/api/v1/auth/login`
