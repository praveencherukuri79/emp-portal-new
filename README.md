# Employee Portal - Multi-Tenant Application

A comprehensive employee management system with timesheet tracking, leave management, document storage, and approval workflows.

## 🎯 Features

- **Multi-tenant architecture** with complete data isolation
- **6 Role-based access levels**: Prospect, Employee, Supervisor, HR, Admin, Employer
- **50+ Features** including timesheets, leave management, documents, approvals, reporting
- **Secure authentication** with JWT tokens
- **Responsive design** with dark/light mode

## 🏗️ Tech Stack

- **Frontend**: Angular 18+
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Email**: Nodemailer

## 📁 Project Structure

```
emp-portal-adv/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── models/       # Mongoose schemas
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── utils/        # Helper functions
│   │   └── server.js     # Entry point
│   ├── uploads/          # File storage
│   └── package.json
│
├── frontend/             # Angular 18+ application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, interceptors
│   │   │   ├── shared/         # Shared components, pipes
│   │   │   ├── features/       # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── timesheets/
│   │   │   │   ├── leaves/
│   │   │   │   ├── documents/
│   │   │   │   └── reports/
│   │   │   └── app.component.ts
│   │   └── environments/
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure MongoDB connection in .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

## 📋 50 Core Features

### User Management (1-8)
✅ User Registration & Login  
✅ Password Reset  
✅ User Profiles & Employee Info  
✅ Visa Tracking  
✅ Role-Based Access Control  

### Timesheet Management (9-16)
✅ Time Entry with Weekly View  
✅ Quick Entry for Multiple Days  
✅ Billable/Non-billable Hours  
✅ Submit & Approval Workflow  

### Leave Management (17-24)
✅ Leave Requests with Multiple Types  
✅ Leave Balance Tracking  
✅ Half-Day Leaves  
✅ Leave Calendar & History  

### Document Management (25-32)
✅ Upload Documents with Categories  
✅ Expiry Tracking & Alerts  
✅ Secure Access Control  
✅ Document Sharing  

### Approval Workflows (33-38)
✅ Timesheet Approvals  
✅ Leave Approvals  
✅ Bulk Actions  
✅ Notifications  

### Dashboard & Analytics (39-44)
✅ Role-based Dashboards  
✅ Quick Actions  
✅ Weekly Summaries  
✅ Charts & Graphs  

### Reporting (45-48)
✅ Timesheet Reports  
✅ Leave Reports  
✅ Team Reports  
✅ Export as PDF/Excel  

### Notifications (49-50)
✅ Email Notifications  
✅ In-App Notifications  

## 🔐 Security Features

- Password encryption (bcrypt)
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-tenant data isolation
- File upload validation
- Rate limiting

## 📱 Supported Roles

1. **Prospect** - Limited profile access
2. **Employee** - Timesheets, leaves, documents
3. **Supervisor** - Employee + team approvals
4. **HR** - Supervisor + all employee management
5. **Admin** - HR + system configuration
6. **Employer** - Full system access + analytics

## 🌐 Environment Variables

See `.env.example` in backend folder for required configuration.

## 📄 License

MIT
