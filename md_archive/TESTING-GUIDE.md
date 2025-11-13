# Complete Employee Portal - Authentication Module Testing Guide

## 🎯 What We've Built

### Backend (TypeScript + Node.js + Express)

✅ **Complete Authentication System**
- User Registration
- User Login  
- Password Reset (Email-based)
- Change Password
- Refresh Token
- Logout
- Get Current User Profile

✅ **Security Features**
- JWT with Access & Refresh Tokens
- Password Hashing (bcrypt)
- Password Strength Validation
- Role-Based Access Control
- Multi-Tenant Data Isolation
- Rate Limiting

✅ **Code Quality**
- Full TypeScript with strict typing
- Reusable utilities (Response, Token, Password, Date, Email, Validation)
- Middleware (Auth, Authorization, Validation)
- Centralized error handling
- Comprehensive validation

## 📦 Installation

### Backend Setup

```powershell
# Navigate to backend
cd d:\Projects\emp-portal-adv\backend

# Install all dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Edit .env with your settings (MongoDB URI, JWT secrets, email)
notepad .env
```

### Required Environment Variables

Minimum configuration in `.env`:

```env
NODE_ENV=development
PORT=5000

# MongoDB (required)
MONGODB_URI=mongodb://localhost:27017/emp-portal

# JWT Secrets (required - change these!)
JWT_SECRET=your-secret-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-at-least-32-characters

# Email (optional for now, needed for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:4200
```

## 🗄️ Database Setup

### Option 1: Local MongoDB

```powershell
# Start MongoDB service
net start MongoDB

# Verify MongoDB is running
mongosh

# Switch to emp-portal database
use emp-portal

# Create a test tenant (organization)
db.tenants.insertOne({
  name: "Test Organization",
  domain: "testorg",
  contactEmail: "admin@testorg.com",
  contactPhone: "+1234567890",
  settings: {
    workDaysPerWeek: 5,
    workHoursPerDay: 8,
    currency: "USD",
    dateFormat: "YYYY-MM-DD",
    timeZone: "UTC"
  },
  subscription: {
    plan: "trial",
    startDate: new Date(),
    maxUsers: 50
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

# Verify tenant was created
db.tenants.find().pretty()
```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a free cluster (M0)
4. Create database user
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Get connection string
7. Update `MONGODB_URI` in `.env`

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/emp-portal
```

## 🚀 Start the Server

```powershell
cd backend
npm run dev
```

Expected output:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
🌍 Environment: development
📡 API Endpoint: http://localhost:5000/api/v1
📧 Email: Configured
```

## 🧪 Test with VS Code REST Client

Create a file `test-auth.http` in backend folder:

```http
### Variables
@baseUrl = http://localhost:5000/api/v1
@tenantDomain = testorg
@accessToken = YOUR_TOKEN_HERE

### Health Check
GET http://localhost:5000/health

### 1. Register New User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "john.doe@testorg.com",
  "password": "Test@12345",
  "firstName": "John",
  "lastName": "Doe",
  "tenantDomain": "{{tenantDomain}}"
}

### 2. Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "john.doe@testorg.com",
  "password": "Test@12345",
  "tenantDomain": "{{tenantDomain}}"
}

### 3. Get Current User (requires token)
GET {{baseUrl}}/auth/me
Authorization: Bearer {{accessToken}}

### 4. Change Password (requires token)
POST {{baseUrl}}/auth/change-password
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "currentPassword": "Test@12345",
  "newPassword": "NewPass@12345"
}

### 5. Forgot Password
POST {{baseUrl}}/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@testorg.com",
  "tenantDomain": "{{tenantDomain}}"
}

### 6. Logout (requires token)
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{accessToken}}

### 7. Refresh Token
POST {{baseUrl}}/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## 🔍 Testing Workflow

### Test 1: Complete Registration & Login Flow

1. **Register a new user**:
   ```json
   POST /api/v1/auth/register
   {
     "email": "jane.smith@testorg.com",
     "password": "Secure@123",
     "firstName": "Jane",
     "lastName": "Smith",
     "tenantDomain": "testorg"
   }
   ```

2. **Verify response**:
   - Should return user object
   - Should return accessToken
   - Should return refreshToken
   - Password should NOT be in response

3. **Login with same credentials**:
   ```json
   POST /api/v1/auth/login
   {
     "email": "jane.smith@testorg.com",
     "password": "Secure@123",
     "tenantDomain": "testorg"
   }
   ```

4. **Copy the accessToken** from response

5. **Get user profile**:
   ```
   GET /api/v1/auth/me
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

### Test 2: Password Reset Flow

1. **Request password reset**:
   ```json
   POST /api/v1/auth/forgot-password
   {
     "email": "jane.smith@testorg.com",
     "tenantDomain": "testorg"
   }
   ```

2. **Check MongoDB for reset token**:
   ```javascript
   db.users.findOne({ email: "jane.smith@testorg.com" })
   ```

3. **Copy the passwordResetToken**

4. **Reset password**:
   ```json
   POST /api/v1/auth/reset-password
   {
     "token": "RESET_TOKEN_FROM_DB",
     "newPassword": "NewSecure@456"
   }
   ```

5. **Login with new password**

### Test 3: Security Features

1. **Test weak password**:
   ```json
   {
     "password": "123456"
   }
   ```
   Should return validation errors

2. **Test duplicate email**:
   Register same email twice - should fail

3. **Test invalid credentials**:
   Login with wrong password - should fail

4. **Test inactive user**:
   Set `isActive: false` in DB, try to login - should fail

5. **Test token expiry**:
   Wait for token to expire, make request - should fail

## 📊 Expected Results

### Successful Registration
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "...",
      "tenantId": "...",
      "email": "john.doe@testorg.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee",
      "isActive": true,
      ...
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Failed Login (Invalid Credentials)
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### Password Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "Password must be at least 8 characters",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one special character"
  ]
}
```

## 🎯 Next Steps

### Option A: Build Angular Frontend
Now that backend is ready, create the Angular 18 frontend with:
- Login/Register components
- Auth service
- HTTP interceptor
- Route guards
- Material Design UI

### Option B: Extend Backend
Add more features:
- User management APIs (CRUD)
- Timesheet APIs
- Leave management APIs
- Document upload

### Option C: Test & Deploy
- Write unit tests
- Write integration tests
- Deploy to cloud (Azure, AWS, Heroku)

## 🐛 Common Issues

### Issue: MongoDB Connection Failed
**Solution**: Ensure MongoDB is running or check Atlas connection string

### Issue: TypeScript Errors
**Solution**: Run `npm install` to install all type definitions

### Issue: Email Not Sending
**Solution**: 
- For Gmail, use App Password (not regular password)
- Enable "Less secure app access" or use OAuth2

### Issue: Token Invalid
**Solution**: Make sure JWT_SECRET matches in .env

## 📚 API Documentation

Full documentation: See `QUICKSTART.md` in backend folder

## ✅ Checklist

Before moving to frontend:
- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Health check endpoint works
- [ ] Can create a tenant in DB
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can get user profile with token
- [ ] Can change password
- [ ] Password validation works

---

**Ready to build the Angular frontend?** Let me know and I'll create the complete authentication UI with login, register, and password reset pages! 🚀
