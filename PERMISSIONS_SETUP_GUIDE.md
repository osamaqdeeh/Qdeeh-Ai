# Permissions Manager Setup Guide

## ✅ What Has Been Created

I've successfully created a comprehensive **Permissions Manager** system for your platform with the following features:

### 🎯 Role Hierarchy

The system now has **4 distinct roles** with different permission levels:

1. **LEADER** 👑 (Highest Level)
   - Email: `qdeehai@gmail.com` (Permanent & Exclusive)
   - Master of all permissions
   - Can manage all user roles
   - Full unrestricted access to everything
   - Cannot be changed or removed

2. **ADMIN** 🛡️
   - Full administrative access
   - Can manage courses, users, and content
   - Access to admin dashboard

3. **VIP** ⭐
   - Premium user with special privileges
   - Exclusive features access
   - Enhanced user experience

4. **USER** 👥 (Basic Level)
   - Standard user access
   - Basic platform features

---

## 📁 Files Created/Modified

### Database Schema
- ✅ **prisma/schema.prisma** - Added `UserRole` enum and `role` field to both `Student` and `Admin` models

### Server Actions
- ✅ **src/lib/actions/permissions.ts** - New server actions for:
  - `getAllUsersWithRoles()` - Get all users with their roles
  - `updateUserRole()` - Update user roles (LEADER only)
  - `getRoleStatistics()` - Get role distribution statistics

### Pages
- ✅ **src/app/(admin)/admin-dashboard-secret/permissions/page.tsx** - New permissions manager page with:
  - Role hierarchy visualization
  - Statistics cards for each role
  - Complete user management interface

### Components
- ✅ **src/components/admin/permissions-table.tsx** - Interactive table component with:
  - Search and filter functionality
  - Role change dropdown for each user
  - Visual role badges
  - User type filtering (Students/Admins)
  - Real-time role updates

### Navigation
- ✅ **src/components/admin/admin-sidebar.tsx** - Updated with:
  - New "Permissions" menu item (LEADER only)
  - Crown icon indicator for LEADER-only features
  - Conditional visibility based on user role

---

## 🗄️ Database Migration Required

**IMPORTANT**: You need to run the database migration manually to apply the schema changes.

### Option 1: Run Migration (Recommended)
Open a **new terminal window** (not in this session) and run:

```bash
npx prisma migrate dev --name add_user_roles
```

This will:
- Create the migration files
- Add the `UserRole` enum to your database
- Add the `role` column to `students` and `admins` tables
- Set default values (USER for students, ADMIN for admins)

### Option 2: Manual Database Update
If you prefer to update manually or the migration fails, run this SQL:

```sql
-- Create the enum type
CREATE TYPE "UserRole" AS ENUM ('USER', 'VIP', 'ADMIN', 'LEADER');

-- Add role column to students table
ALTER TABLE "students" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Add role column to admins table
ALTER TABLE "admins" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'ADMIN';

-- Set LEADER role for the designated email
UPDATE "admins" SET "role" = 'LEADER' WHERE "email" = 'qdeehai@gmail.com';
```

### After Migration
Once the migration is complete, run:

```bash
npx prisma generate
```

---

## 🚀 How to Use the Permissions Manager

### Accessing the Page
1. Sign in as the LEADER (qdeehai@gmail.com)
2. Navigate to the admin dashboard
3. Click on "Permissions" in the sidebar (marked with a crown icon 👑)

### Managing User Roles
1. **Search Users**: Use the search bar to find users by name or email
2. **Filter by Role**: Select a specific role to filter users
3. **Filter by Type**: Choose between Students, Admins, or All
4. **Change Roles**: Click "Change Role" dropdown on any user to assign:
   - USER (Basic access)
   - VIP (Premium features)
   - ADMIN (Administrative access)
   - LEADER (Reserved - cannot be assigned to others)

### Role Change Rules
- ✅ Only LEADER can change user roles
- ✅ LEADER role is permanent for qdeehai@gmail.com
- ✅ No other user can be assigned LEADER role
- ✅ All changes are logged in admin activity logs
- ✅ Real-time updates with toast notifications

---

## 🎨 Features Included

### Visual Indicators
- **Color-coded role badges**: Each role has a unique color and icon
- **Leader-only sections**: Marked with amber borders and crown icons
- **Statistics dashboard**: Live counts for each role type
- **User type badges**: Distinguish between Students and Admins

### Security Features
- **Leader protection**: The LEADER role cannot be changed or removed
- **Access control**: Only LEADER can access the permissions manager
- **Activity logging**: All role changes are tracked
- **Validation**: Prevents invalid role assignments

### User Experience
- **Fast search**: Instant filtering by name or email
- **Multi-filter support**: Combine search, role, and type filters
- **Responsive design**: Works on all screen sizes
- **Loading states**: Visual feedback during role updates
- **Toast notifications**: Success/error messages for all actions

---

## 📊 Permissions Page Layout

### Top Section
- Page title with crown icon
- Description and LEADER notice banner
- Role hierarchy explanation cards (4 boxes showing each role)

### Statistics Cards
- Total LEADERS count
- Total ADMINS count  
- Total VIP USERS count
- Total REGULAR USERS count

### Main Table
- User avatar and name
- Email address
- User type (STUDENT/ADMIN)
- Current role badge
- User statistics (enrollments, payments, or activity)
- Join date
- Change role dropdown button

---

## 🔒 Security Notes

1. **LEADER Email**: Hardcoded as `qdeehai@gmail.com` in multiple files for security
2. **Access Control**: Non-LEADER users are redirected from the permissions page
3. **Role Hierarchy**: Cannot assign LEADER role to anyone except the designated email
4. **Audit Trail**: All permission changes are logged in `AdminActivityLog`

---

## 🧪 Testing the System

After running the migration, test these scenarios:

1. **Login as LEADER** (qdeehai@gmail.com)
   - ✅ Should see "Permissions" in sidebar
   - ✅ Can access `/admin-dashboard-secret/permissions`
   - ✅ Can change any user's role

2. **Login as Regular Admin**
   - ✅ Should NOT see "Permissions" in sidebar
   - ✅ Cannot access permissions page (redirected)

3. **Change User Roles**
   - ✅ Select a user and change from USER to VIP
   - ✅ Select a user and change from VIP to ADMIN
   - ✅ Verify changes appear immediately
   - ✅ Check that blocked users are indicated

4. **Test Protections**
   - ✅ Try to change LEADER's role (should be prevented)
   - ✅ Try to assign LEADER to another user (should fail)

---

## 🎉 Ready to Deploy!

Once you've run the migration, your Permissions Manager is fully operational! 

**Next Steps:**
1. Run the database migration (see above)
2. Restart your development server: `npm run dev`
3. Login as LEADER
4. Navigate to the Permissions page
5. Start managing user roles!

---

## 🆘 Need Help?

If you encounter any issues:
- Check that the migration ran successfully
- Verify the database has the new `UserRole` enum
- Ensure `qdeehai@gmail.com` exists as an admin
- Check the browser console for any errors
- Verify environment variables are loaded

Enjoy your new Permissions Manager! 🎊
