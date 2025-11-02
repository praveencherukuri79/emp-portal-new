# Backend Setup Instructions

## 📦 Installation

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Configure Environment

Copy the `.env.example` file to `.env`:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` with your configuration:

```env
# Database - Update this with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/emp-portal
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emp-portal

# JWT Secrets - CHANGE THESE IN PRODUCTION!
JWT_SECRET=your-unique-secret-key-here
JWT_REFRESH_SECRET=your-unique-refresh-secret-here

# Email Configuration (for Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### 3. Start MongoDB

If using local MongoDB:

```powershell
# Start MongoDB service
net start MongoDB
```

Or use MongoDB Atlas (cloud) - update `MONGODB_URI` in `.env`

### 4. Run the Application

Development mode (with hot reload):

```powershell
npm run dev
```

Production mode:

```powershell
npm run build
npm start
```

## 🧪 Testing the API

The server will start on `http://localhost:5000`

Health check endpoint:
```
GET http://localhost:5000/health
```

API endpoints are prefixed with `/api/v1`:
```
POST http://localhost:5000/api/v1/auth/register
POST http://localhost:5000/api/v1/auth/login
```

## 📚 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run watch` - Watch TypeScript files for changes
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

## 🔧 Common Issues

### TypeScript Errors During Development

TypeScript errors shown in the editor will resolve automatically after running `npm install`.

### MongoDB Connection Error

Make sure MongoDB is running:
- **Local**: Start MongoDB service
- **Atlas**: Check connection string and network access

### Email Not Sending

For Gmail, you need an **App Password**:
1. Enable 2FA on your Google account
2. Go to Google Account > Security > App Passwords
3. Generate a password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── models/         # Mongoose models (currently in JS, will convert)
│   ├── controllers/    # Route controllers (to be created)
│   ├── routes/         # API routes (to be created)
│   ├── middleware/     # Auth, validation middleware
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── server.ts       # Entry point (to be converted)
├── uploads/            # File uploads storage
├── dist/               # Compiled JavaScript (after build)
└── package.json
```

## 🚀 Next Steps

After backend is running, we'll create:
1. Auth controllers and routes (register, login, password reset)
2. User management APIs
3. Timesheet APIs
4. Leave management APIs
5. Document upload APIs
6. Angular frontend

## 📞 Support

For issues, check the console logs for detailed error messages.
