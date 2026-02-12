# 🚀 QdeehAi - Quick Localhost Setup

Follow these steps to get QdeehAi running on your local machine.

## ✅ Prerequisites

Make sure you have these installed:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 📋 Step-by-Step Setup

### Step 1: Install PostgreSQL

**Windows:**
```bash
# Download and install from https://www.postgresql.org/download/windows/
# During installation, remember your postgres user password
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

Open a terminal and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# In the PostgreSQL prompt, create the database:
CREATE DATABASE qdeeh_ai;

# Exit PostgreSQL
\q
```

**If you get permission errors on Windows, use:**
```bash
# Open Command Prompt as Administrator
cd "C:\Program Files\PostgreSQL\14\bin"
psql -U postgres
```

### Step 3: Install Dependencies

```bash
# Navigate to the project directory
cd qdeeh-ai

# Install all packages
npm install
```

This will install all required dependencies including Next.js, Prisma, and all UI components.

### Step 4: Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# Seed database with sample data
npm run db:seed
```

**Expected Output:**
```
✅ Admin user created: admin@example.com
✅ Student user created: student@example.com
✅ Categories created: 4
✅ Course created: Complete Web Development Bootcamp 2025
✅ Sections and lessons created
✅ Course created: React Native Mobile Development
✅ Coupons created
✅ Review created
✅ Settings created

🎉 Seed completed successfully!

📝 Test Credentials:
Admin - Email: admin@example.com | Password: admin123
Student - Email: student@example.com | Password: student123
```

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.0.3
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### Step 6: Access the Application

Open your browser and go to:

🌐 **Main Website:** http://localhost:3000
🔐 **Admin Panel:** http://localhost:3000/admin-dashboard-secret
📚 **Courses:** http://localhost:3000/courses
👤 **Sign In:** http://localhost:3000/auth/signin

## 🔑 Login Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123
- **Access:** Full admin panel access

### Student Account
- **Email:** student@example.com
- **Password:** student123
- **Access:** Student dashboard and courses

## 🎯 What You Can Do Now

### As Admin:
1. Login at http://localhost:3000/admin-dashboard-secret
2. View dashboard with analytics
3. Manage courses (create, edit, delete)
4. View all users
5. Create coupons
6. Approve reviews

### As Student:
1. Browse courses at http://localhost:3000/courses
2. View course details
3. Enroll in courses (requires Stripe setup for payments)
4. View dashboard at http://localhost:3000/dashboard
5. Track learning progress

## 🛠️ Troubleshooting

### Database Connection Failed

**Error:** "Can't reach database server"

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows:
services.msc  # Look for postgresql-x64-14

# macOS:
brew services list

# Linux:
sudo systemctl status postgresql

# If not running, start it:
# macOS:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql
```

### Database "qdeeh_ai" does not exist

**Solution:**
```bash
psql -U postgres
CREATE DATABASE qdeeh_ai;
\q
npm run db:push
```

### Prisma Client Not Generated

**Error:** "Cannot find module '@prisma/client'"

**Solution:**
```bash
npm run db:generate
```

### Port 3000 Already in Use

**Error:** "Port 3000 is already in use"

**Solution:**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use a different port:
PORT=3001 npm run dev
```

### npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## 📦 Optional Services Setup

### For Payment Processing (Stripe)

1. Create account at https://stripe.com/
2. Get test API keys from Dashboard
3. Update `.env`:
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### For Video Upload (Cloudflare Stream)

1. Sign up at https://www.cloudflare.com/
2. Go to Stream section
3. Get credentials
4. Update `.env`:
```env
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_STREAM_API_TOKEN="your-token"
```

## 🔄 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Open Prisma Studio (Database GUI)
npm run db:studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Check for TypeScript errors
npx tsc --noEmit

# Run linting
npm run lint
```

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `qdeeh_ai` created
- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] Prisma Client generated
- [ ] Database schema pushed (tables created)
- [ ] Sample data seeded
- [ ] Development server running on http://localhost:3000
- [ ] Can access main website
- [ ] Can login to admin panel
- [ ] Can browse courses

## 🎉 Success!

If you can access http://localhost:3000 and see the QdeehAi homepage, you're all set! 

### Next Steps:
1. Explore the admin panel
2. Create your first course
3. Customize the branding
4. Set up payment integration
5. Configure video hosting

## 💡 Tips

- Use **Prisma Studio** (`npm run db:studio`) to view and edit database records visually
- Check the browser console for any errors
- The `.env` file contains all configuration - never commit this file to Git!
- Use the test Stripe cards for testing payments: `4242 4242 4242 4242`

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Detailed Setup Guide](./SETUP.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Look at the terminal/console for error messages
3. Review the `.env` file for correct configuration
4. Ensure PostgreSQL is running

---

**Welcome to QdeehAi! 🚀 Happy learning!**
