# 🚀 Quick Start Guide - Backend

## Step 1: Install Dependencies

```powershell
cd backend
npm install
```

This will install all required packages including TypeScript, Express, Mongoose, and more.

## Step 2: Set Up Environment

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your settings:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/emp-portal

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=my-super-secret-key-change-me
JWT_REFRESH_SECRET=my-refresh-secret-key-change-me

# Email (Optional for now)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:4200
```

## Step 3: Start MongoDB

### Option A: Local MongoDB
```powershell
net start MongoDB
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Step 4: Run the Server

Development mode (with hot reload):

```powershell
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
🌍 Environment: development
📡 API Endpoint: http://localhost:5000/api/v1
```

## Step 5: Test the API

### Health Check
```powershell
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Employee Portal API is running",
  "timestamp": "2025-11-02T...",
  "environment": "development"
}
```

## 🧪 Test Authentication Endpoints

### 1. Register a New Organization & User

First, you need to create a tenant (organization) manually in MongoDB:

```javascript
// Connect to MongoDB
use emp-portal

// Create a tenant
db.tenants.insertOne({
  name: "My Company",
  domain: "mycompany",
  contactEmail: "admin@mycompany.com",
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
    maxUsers: 10
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 2. Register a User

```powershell
curl -X POST http://localhost:5000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john.doe@mycompany.com",
    "password": "Test@1234",
    "firstName": "John",
    "lastName": "Doe",
    "tenantDomain": "mycompany"
  }'
```

Expected response:
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": { ...user details... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login

```powershell
curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john.doe@mycompany.com",
    "password": "Test@1234",
    "tenantDomain": "mycompany"
  }'
```

### 4. Get Current User Profile

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
curl -X GET http://localhost:5000/api/v1/auth/me `
  -H "Authorization: Bearer $token"
```

### 5. Change Password

```powershell
curl -X POST http://localhost:5000/api/v1/auth/change-password `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    "currentPassword": "Test@1234",
    "newPassword": "NewPass@1234"
  }'
```

### 6. Forgot Password

```powershell
curl -X POST http://localhost:5000/api/v1/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john.doe@mycompany.com",
    "tenantDomain": "mycompany"
  }'
```

### 7. Refresh Token

```powershell
curl -X POST http://localhost:5000/api/v1/auth/refresh-token `
  -H "Content-Type: application/json" `
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 8. Logout

```powershell
curl -X POST http://localhost:5000/api/v1/auth/logout `
  -H "Authorization: Bearer $token"
```

## 📋 Available Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset password with token | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| POST | `/api/v1/auth/change-password` | Change password | Yes |

## 🛠️ Useful Commands

```powershell
# Development server
npm run dev

# Build TypeScript
npm run build

# Run production
npm start

# Watch TypeScript changes
npm run watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Change PORT in .env file
PORT=5001
```

### MongoDB Connection Error
```powershell
# Check MongoDB is running
net start MongoDB

# Or use MongoDB Compass to verify connection
```

### TypeScript Errors
All TypeScript errors will resolve after running `npm install`.

## 📱 Test with Postman/Thunder Client

1. Install Postman or Thunder Client VS Code extension
2. Create a new collection
3. Add requests for each endpoint
4. Save access token as environment variable
5. Use `{{accessToken}}` in Authorization header

## ✅ What's Working Now

- ✅ User Registration
- ✅ User Login
- ✅ JWT Authentication
- ✅ Password Reset Flow
- ✅ Change Password
- ✅ Refresh Token
- ✅ Role-Based Access Control
- ✅ Multi-Tenant Support
- ✅ Email Notifications (if configured)

## 🎯 Next: Build Frontend

Once backend is working, we'll create the Angular frontend!
