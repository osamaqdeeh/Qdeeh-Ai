# 🪟 QdeehAi - Windows Setup Guide

Complete setup guide for Windows users.

## 📋 Prerequisites

### 1. Install Node.js
1. Download from: https://nodejs.org/ (LTS version)
2. Run the installer
3. Check installation:
```cmd
node --version
npm --version
```

### 2. Install PostgreSQL

1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer (version 14 or higher)
3. **IMPORTANT:** Remember the password you set for `postgres` user!
4. Default port: 5432 (keep this)
5. Click "Next" through Stack Builder (optional)

### 3. Verify PostgreSQL Installation

Open Command Prompt as Administrator:
```cmd
# Navigate to PostgreSQL bin folder
cd "C:\Program Files\PostgreSQL\14\bin"

# Test connection
psql -U postgres
```

Enter your password when prompted. If successful, you'll see:
```
postgres=#
```

Type `\q` to exit.

## 🗄️ Database Setup

### Create Database

In Command Prompt (as Administrator):
```cmd
cd "C:\Program Files\PostgreSQL\14\bin"
psql -U postgres
```

Then in PostgreSQL prompt:
```sql
CREATE DATABASE qdeeh_ai;
\l
\q
```

You should see `qdeeh_ai` in the list of databases.

## 📦 Project Setup

### 1. Navigate to Project Folder
```cmd
cd C:\path\to\qdeeh-ai
```

### 2. Install Dependencies
```cmd
npm install
```

This will take a few minutes. You should see:
```
added 500+ packages
```

### 3. Check .env File

The `.env` file should already exist. Verify it has:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/qdeeh_ai?schema=public"
```

**Replace `YOUR_PASSWORD` with your actual PostgreSQL password!**

### 4. Setup Database Schema
```cmd
npm run db:generate
```

Expected output:
```
✔ Generated Prisma Client
```

Then:
```cmd
npm run db:push
```

Expected output:
```
Your database is now in sync with your schema.
```

### 5. Seed Sample Data
```cmd
npm run db:seed
```

Expected output:
```
✅ Admin user created: admin@example.com
✅ Student user created: student@example.com
✅ Categories created: 4
✅ Courses created
🎉 Seed completed successfully!
```

## 🚀 Run the Application

### Start Development Server
```cmd
npm run dev
```

Expected output:
```
▲ Next.js 15.0.3
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

### Open Browser
Navigate to: **http://localhost:3000**

You should see the QdeehAi homepage! 🎉

## 🔐 Test Login

### Admin Account
1. Go to: http://localhost:3000/admin-dashboard-secret
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

### Student Account
1. Go to: http://localhost:3000/auth/signin
2. Login with:
   - Email: `student@example.com`
   - Password: `student123`

## 🛠️ Troubleshooting

### PostgreSQL Not Running

**Error:** "Can't reach database server"

**Solution:**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find `postgresql-x64-14` (or similar)
4. Right-click → Start
5. Set Startup type to "Automatic"

### Port 3000 Already in Use

**Error:** "Port 3000 is already in use"

**Solution:**
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use npx
npx kill-port 3000
```

### Database Connection Failed

**Error:** "Authentication failed for user postgres"

**Solution:**
1. Check your password in `.env` file
2. Make sure you're using the correct password
3. Try resetting postgres password:

```cmd
cd "C:\Program Files\PostgreSQL\14\bin"
psql -U postgres
\password postgres
# Enter new password twice
\q
```

Update `.env` with new password.

### npm install Fails

**Error:** Various npm errors

**Solution:**
```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Prisma Client Error

**Error:** "Cannot find module '@prisma/client'"

**Solution:**
```cmd
npm run db:generate
```

### Permission Denied

**Error:** "Access denied" or "Permission denied"

**Solution:**
- Run Command Prompt as Administrator
- Right-click Command Prompt → "Run as administrator"

## 📊 View Database (Optional)

Open Prisma Studio to see your data visually:
```cmd
npm run db:studio
```

This opens a web interface at: http://localhost:5555

## 🔄 Useful Commands

```cmd
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Open Prisma Studio (database viewer)
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check for errors
npm run lint
```

## 🎯 Next Steps

Now that everything is running:

1. ✅ Explore the admin panel
2. ✅ Create your first course
3. ✅ Customize the design
4. ✅ Add Stripe for payments (optional)
5. ✅ Add Cloudflare Stream for videos (optional)

## 📚 Additional Resources

- [Quick Start Guide](./START_HERE.md)
- [Full Documentation](./README.md)
- [Setup Guide](./SETUP.md)

## 🆘 Still Having Issues?

Common solutions:

1. **Restart everything:**
   ```cmd
   # Stop the dev server (Ctrl+C)
   # Restart PostgreSQL service
   # Run: npm run dev
   ```

2. **Check Windows Firewall:**
   - Allow Node.js through firewall
   - Allow PostgreSQL through firewall

3. **Verify installations:**
   ```cmd
   node --version  # Should show v18 or higher
   npm --version   # Should show 9 or higher
   psql --version  # Should show 14 or higher
   ```

4. **Fresh start:**
   ```cmd
   npm cache clean --force
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   npm run db:generate
   npm run db:push
   npm run db:seed
   npm run dev
   ```

---

**✅ You're all set! Welcome to QdeehAi on Windows! 🎉**
