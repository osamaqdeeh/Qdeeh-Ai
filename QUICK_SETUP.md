# 🚀 Quick Setup for QdeehAi (Updated with Separate Admin/Student Tables)

## Step 1: Install PostgreSQL
Download: https://www.postgresql.org/download/

## Step 2: Create Database
```bash
psql -U postgres
CREATE DATABASE qdeeh_ai;
\q
```

## Step 3: Install Dependencies
```bash
npm install
```

## Step 4: Setup Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Step 5: Start Server
```bash
npm run dev
```

## 🔑 Login Information

### ADMIN LOGIN
- **URL**: http://localhost:3000/auth/admin-signin
- **Email**: admin@example.com
- **Password**: admin123
- **Stored in**: `admins` table
- **Dashboard**: http://localhost:3000/admin-dashboard-secret

### STUDENT LOGIN
- **URL**: http://localhost:3000/auth/signin
- **Email**: student@example.com
- **Password**: student123
- **Stored in**: `students` table
- **Dashboard**: http://localhost:3000/dashboard

### STUDENT SIGNUP
- **URL**: http://localhost:3000/auth/signup
- **Creates account in**: `students` table

## ✅ What's Different Now

✅ **Admins** stored in `admins` table
✅ **Students** stored in `students` table
✅ **Separate login pages** for admin and students
✅ **Admin can convert students** to admins
✅ **Complete separation** of data

## 🎯 Next Steps

1. Test admin login at `/auth/admin-signin`
2. Test student login at `/auth/signin`
3. Create new student at `/auth/signup`
4. In admin panel, you can convert students to admins
