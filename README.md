# Employee Portal - Multi-Tenant Application

**Version**: 2.1.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 12, 2025

A comprehensive employee management system with timesheet tracking, leave management, document storage, and approval workflows.

---

## 🎯 Features

- **Multi-tenant architecture** with complete data isolation
- **6 Role-based access levels**: Prospect, Employee, Supervisor, HR, Admin, Employer
- **50+ Features** including timesheets, leave management, documents, approvals, reporting
- **Secure authentication** with JWT tokens
- **Responsive design** with dark/light mode
- **Permission-based authorization** system
- **Email & in-app notifications**
- **Bulk operations** for efficient management
- **Report export** (PDF & Excel)

---

## 🏗️ Tech Stack

### Frontend
- Angular 18+
- TypeScript
- Material Design
- RxJS
- DayJs (date library)

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB with Mongoose ODM
- JWT Authentication
- Nodemailer (email)

### Shared
- TypeScript types & interfaces
- Shared utilities
- Validation constants

---

## 📁 Project Structure

```
emp-portal-new/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── models/       # Mongoose schemas (8 models)
│   │   ├── controllers/  # Route controllers (14 controllers)
│   │   ├── routes/       # API routes (14 routes)
│   │   ├── middleware/   # Auth, validation, permissions (4)
│   │   ├── services/     # Business logic (10 services)
│   │   ├── utils/        # Utilities (16 utils)
│   │   ├── dto/          # Data transformations (11 DTOs)
│   │   └── server.ts
│   └── package.json
│
├── frontend/             # Angular 18 application
│   ├── src/app/
│   │   ├── core/         # Services, guards, interceptors
│   │   ├── features/     # Feature modules
│   │   ├── services/     # Feature services (10 services)
│   │   ├── shared/       # Shared components & utilities
│   │   └── app.routes.ts
│   └── package.json
│
└── shared/               # Shared types & utilities
    ├── types/            # TypeScript types (7 files)
    └── utils/            # Shared utilities (1 file)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run build
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run build  # or ng serve for dev
```

Frontend runs on: `http://localhost:4200`

---

## 📋 Core Features

### User Management (Features 1-8)
✅ User Registration & Login  
✅ Password Reset  
✅ User Profiles & Employee Info  
✅ Visa Tracking  
✅ Role-Based Access Control  
✅ Permission-Based Authorization

### Timesheet Management (Features 9-16)
✅ Time Entry with Weekly View  
✅ Quick Entry for Multiple Days  
✅ Billable/Non-billable Hours  
✅ Submit & Approval Workflow  
✅ Email Notifications

### Leave Management (Features 17-24)
✅ Leave Requests with Multiple Types  
✅ Leave Balance Tracking & Auto-Deduction  
✅ Half-Day Leaves  
✅ Leave Calendar & History  
✅ Email Notifications

### Document Management (Features 25-32)
✅ Upload Documents with Categories  
✅ Expiry Tracking & Alerts  
✅ Secure Access Control  
✅ Document Sharing  
✅ Bulk Operations

### Approval Workflows (Features 33-38)
✅ Timesheet Approvals  
✅ Leave Approvals  
✅ Bulk Actions  
✅ Email & In-App Notifications

### Dashboard & Analytics (Features 39-44)
✅ Role-based Dashboards  
✅ Quick Actions  
✅ Weekly Summaries  
✅ Charts & Graphs

### Reporting (Features 45-48)
✅ Timesheet Reports  
✅ Leave Reports  
✅ Team Reports  
✅ Export as PDF/Excel

### Notifications (Features 49-50)
✅ Email Notifications  
✅ In-App Notifications

### **NEW** in v2.1.0
✅ Project Management Module  
✅ Bulk Operations  
✅ Report Export (PDF/Excel)  
✅ Enhanced Notifications  
✅ Toast UI Notifications

---

## 🔐 Security Features

- Password encryption (bcrypt)
- JWT authentication with refresh tokens
- Permission-based access control (PBAC)
- Role-based access control (RBAC)
- Multi-tenant data isolation
- File upload validation
- Input sanitization
- Tenant context validation

---

## 📱 Supported Roles

1. **Prospect** - Limited profile access
2. **Employee** - Timesheets, leaves, documents
3. **Supervisor** - Employee + team approvals
4. **HR** - Supervisor + all employee management
5. **Admin** - HR + system configuration
6. **Employer** - Full system access + analytics

---

## 🌐 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/emp-portal

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:4200
```

See backend/SETUP.md for complete setup instructions.

---

## 📖 Documentation

### Essential Docs:
- **README.md** - This file
- **REFACTORING_v2.1.0.md** - Refactoring details
- **CHANGELOG_v2.1.0.md** - Version changelog
- **APPLICATION_STRUCTURE_GUIDE.md** - Architecture
- **ARCHITECTURE_REFACTOR_SUMMARY.md** - Permission system
- **MISSING_FUNCTIONALITY_ANALYSIS.md** - Future roadmap

### Backend Docs:
- `backend/SETUP.md` - Setup instructions
- `backend/QUICKSTART.md` - Quick start guide

### Archive:
- `md_archive/` - Old documentation

---

## 🛠️ Development

### Build Commands

**Backend:**
```bash
npm run dev      # Development mode
npm run build    # Build TypeScript
npm start        # Production mode
```

**Frontend:**
```bash
ng serve         # Development server
ng build         # Production build
ng test          # Run tests
```

---

## 🎯 API Endpoints

**Base URL**: `http://localhost:5000/api/v1`

### Main Routes:
- `/auth` - Authentication (8 endpoints)
- `/users` - User management (10 endpoints)
- `/timesheets` - Timesheet operations (10 endpoints)
- `/leaves` - Leave management (10 endpoints)
- `/documents` - Document management (9 endpoints)
- `/projects` - **NEW** Project management (6 endpoints)
- `/bulk` - **NEW** Bulk operations (6 endpoints)
- `/reports` - Report generation (6 endpoints)
- `/notifications` - Notifications (5 endpoints)
- `/dashboard` - Role-based dashboards (6 endpoints)
- `/employer` - Employer analytics (3 endpoints)

**Total**: 79+ API endpoints

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend  
cd frontend
npm test
```

---

## 📊 Build Status

- ✅ Backend: SUCCESS (0 errors)
- ✅ Frontend: SUCCESS (0 errors)
- ✅ TypeScript: 100% type-safe
- ✅ Linting: 0 errors

---

## 🤝 Contributing

This is a production-ready application. All utilities and shared types are in place for easy feature development.

### Adding New Features:
1. Use shared types from `@shared/types`
2. Use validation from `@shared/types/validation`
3. Use utilities from backend `@utils` or frontend `@shared/utils`
4. Follow permission-based authorization pattern
5. Add DTOs for API responses
6. Add proper error handling

---

## 📄 License

MIT

---

## 📞 Support

For setup help, see:
- `backend/SETUP.md`
- `backend/QUICKSTART.md`
- `REFACTORING_v2.1.0.md`

---

**Version**: 2.1.0  
**Status**: ✅ Production Ready  
**Build**: ✅ Passing
