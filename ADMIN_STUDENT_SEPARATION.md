# 🔐 Admin & Student Separation Guide

## ✅ What Has Been Fixed

Your QdeehAi platform now has **complete separation** between Admins and Students:

### 📊 Database Structure

#### **ADMINS Table** (`admins`)
- Stores all administrator accounts
- Fields: email, password, name, isSuperAdmin, permissions, lastLoginAt
- Separate from students completely
- Can track activity with `AdminActivityLog` table

#### **STUDENTS Table** (`students`)
- Stores all student accounts
- Fields: email, password, name, phone, country, bio, blocked
- Separate from admins completely
- Handles all student-related data (enrollments, payments, reviews, etc.)

#### **StudentToAdminConversion Table**
- Tracks when a student is promoted to admin
- Records who did the conversion and when
- Preserves history of conversions

### 🔑 Authentication System

#### **Student Login**
- URL: `/auth/signin`
- Stored in: `students` table
- Redirects to: `/dashboard` (student dashboard)
- User Type: `STUDENT`

#### **Admin Login**
- URL: `/auth/admin-signin` (separate login page)
- Stored in: `admins` table
- Redirects to: `/admin-dashboard-secret` (admin panel)
- User Type: `ADMIN`

### 🚀 Key Features

1. **Separate Tables**: Admins and Students are in completely different tables
2. **Separate Login Pages**: Different URLs for student and admin login
3. **Student to Admin Conversion**: Super admins can convert students to admins
4. **Activity Logging**: All admin actions are logged
5. **Super Admin Role**: Special admin with full permissions
6. **Blocked Students**: Admins can block student accounts

## 📝 How to Use

### For Students (Sign Up)
```
1. Go to: http://localhost:3000/auth/signup
2. Fill in details (stored in STUDENTS table)
3. Login at: http://localhost:3000/auth/signin
4. Access: http://localhost:3000/dashboard
```

### For Admins (Login)
```
1. Go to: http://localhost:3000/auth/admin-signin
2. Enter admin credentials (from ADMINS table)
3. Access: http://localhost:3000/admin-dashboard-secret
```

### Convert Student to Admin
```typescript
// Only super admins can do this
import { convertStudentToAdmin } from "@/lib/actions/admin";

const result = await convertStudentToAdmin(studentId, "Promotion notes");
// This creates an admin account and blocks the student account
```

## 🧪 Test Credentials

After running `npm run db:seed`:

**ADMIN** (in `admins` table):
- Email: admin@example.com
- Password: admin123
- Login at: /auth/admin-signin
- Type: SUPER ADMIN

**STUDENTS** (in `students` table):
- Student 1:
  - Email: student@example.com
  - Password: student123
- Student 2:
  - Email: jane@example.com
  - Password: student123
- Login at: /auth/signin

## 🔧 Database Commands

```bash
# Reset and recreate database
npm run db:push

# Seed with test data
npm run db:seed

# View database in browser
npm run db:studio
```
