# 🚀 QdeehAi - Complete Installation Guide

## Your PostgreSQL Settings:
- **Password**: qdeeh059ai
- **Port**: 5432
- **User**: postgres
- **Database Name**: qdeeh_ai

---

## 📋 Prerequisites

Make sure you have installed:
1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)

---

## 🎯 Automatic Setup (Recommended)

### Step 1: Create Database
Double-click: **`setup-database.bat`**

This will:
- Connect to PostgreSQL
- Create database `qdeeh_ai`
- Use password: `qdeeh059ai`

### Step 2: Complete Setup
Double-click: **`setup.bat`**

This will automatically:
- Install all dependencies
- Generate Prisma Client
- Create database tables
- Seed test data

### Step 3: Start Server
Double-click: **`start-dev.bat`**

Your app will be available at: **http://localhost:3000**

---

## 🖱️ Manual Setup (If Automatic Fails)

### 1. Open Command Prompt as Administrator

Press `Win + X` → Select "Command Prompt (Admin)" or "Terminal (Admin)"

### 2. Navigate to Project Folder
```cmd
cd C:\path\to\qdeeh-ai
```

### 3. Create Database
```cmd
set PGPASSWORD=qdeeh059ai
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE qdeeh_ai;"
```

### 4. Install Dependencies
```cmd
npm install
```

### 5. Setup Database Tables
```cmd
npm run db:generate
npm run db:push
npm run db:seed
```

### 6. Start Development Server
```cmd
npm run dev
```

---

## 🔐 Login Credentials

### ADMIN Account (in `admins` table)
- **Login URL**: http://localhost:3000/auth/admin-signin
- **Email**: admin@example.com
- **Password**: admin123
- **Access**: Admin Panel

### STUDENT Account (in `students` table)
- **Login URL**: http://localhost:3000/auth/signin
- **Email**: student@example.com
- **Password**: student123
- **Access**: Student Dashboard

---

## ✅ Verify Installation

After setup, check:

1. **Database Created**:
   ```cmd
   psql -U postgres -p 5432
   \l
   # Should see 'qdeeh_ai' in the list
   ```

2. **Tables Created**:
   ```cmd
   npm run db:studio
   # Opens http://localhost:5555
   # Should see: admins, students, courses, etc.
   ```

3. **Server Running**:
   - Visit: http://localhost:3000
   - Should see QdeehAi homepage

---

## 🆘 Troubleshooting

### Error: "psql is not recognized"
**Solution**: Add PostgreSQL to PATH
1. Open System Properties → Environment Variables
2. Edit PATH variable
3. Add: `C:\Program Files\PostgreSQL\14\bin`

### Error: "password authentication failed"
**Solution**: 
1. Your password is: `qdeeh059ai`
2. Update `.env` file if needed
3. Check PostgreSQL is running

### Error: "database already exists"
**Solution**: This is fine! Skip database creation, continue to step 4.

### Error: "Port 3000 is already in use"
**Solution**:
```cmd
npx kill-port 3000
npm run dev
```

### PostgreSQL Not Running
**Solution**:
1. Press `Win + R`
2. Type: `services.msc`
3. Find `postgresql-x64-14`
4. Right-click → Start

---

## 📁 Batch Files Explained

### `setup-database.bat`
- Creates the database
- One-time setup

### `setup.bat`
- Installs everything
- Sets up tables
- Adds test data
- Run this once

### `start-dev.bat`
- Starts the server
- Run this every time you want to work

---

## 🎯 Quick Commands Reference

```cmd
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Create/update database tables
npm run db:push

# Add test data
npm run db:seed

# Start development server
npm run dev

# View database in browser
npm run db:studio

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🔄 Starting Fresh

If you need to reset everything:

```cmd
# Reset database
npx prisma migrate reset

# Or manually drop database
psql -U postgres -p 5432 -c "DROP DATABASE qdeeh_ai;"
psql -U postgres -p 5432 -c "CREATE DATABASE qdeeh_ai;"

# Then run setup again
npm run db:push
npm run db:seed
```

---

## ✨ What's Included

After setup, you'll have:
- ✅ Complete database with all tables
- ✅ Test admin account (Super Admin)
- ✅ Test student accounts (2 students)
- ✅ Sample courses (2 courses)
- ✅ Sample lessons and sections
- ✅ Sample coupons
- ✅ Sample reviews
- ✅ All UI components ready
- ✅ Separate admin and student areas

---

## 🎊 You're Ready!

Your QdeehAi platform is now fully set up!

### Main URLs:
- **Homepage**: http://localhost:3000
- **Admin Login**: http://localhost:3000/auth/admin-signin
- **Student Login**: http://localhost:3000/auth/signin
- **Student Signup**: http://localhost:3000/auth/signup
- **Browse Courses**: http://localhost:3000/courses

### Admin Panel:
- **Dashboard**: http://localhost:3000/admin-dashboard-secret
- **Courses**: http://localhost:3000/admin-dashboard-secret/courses
- **Users**: http://localhost:3000/admin-dashboard-secret/users
- **Coupons**: http://localhost:3000/admin-dashboard-secret/coupons

---

**Need Help?** Check the other documentation files:
- `FIXED_SUMMARY.md` - What was fixed
- `QUICK_SETUP.md` - Quick reference
- `ADMIN_STUDENT_SEPARATION.md` - How admin/student separation works
