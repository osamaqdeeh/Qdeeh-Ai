# 🎓 Welcome to QdeehAi!

## 🚀 Quick Start - Get Running in 5 Minutes!

### Step 1: Install PostgreSQL
Download and install PostgreSQL: https://www.postgresql.org/download/

**Remember your postgres password during installation!**

### Step 2: Create Database
Open your terminal (Command Prompt on Windows) and run:

```bash
# Connect to PostgreSQL (it will ask for password)
psql -U postgres

# Create the database
CREATE DATABASE qdeeh_ai;

# Exit
\q
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### Step 5: Start the App!
```bash
npm run dev
```

### Step 6: Open Browser
Go to: **http://localhost:3000**

## 🔑 Login Credentials

**Admin Panel:** http://localhost:3000/admin-dashboard-secret
- Email: admin@example.com
- Password: admin123

**Student Account:**
- Email: student@example.com
- Password: student123

## ✅ That's It!

You now have a fully functional AI-powered educational platform running locally!

---

## 📚 Need More Details?

- **Quick Setup:** See [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md)
- **Full Documentation:** See [README.md](./README.md)
- **Detailed Configuration:** See [SETUP.md](./SETUP.md)

## 🎯 What Can You Do Now?

### As Admin (login at /admin-dashboard-secret):
- ✅ View analytics dashboard
- ✅ Create and manage courses
- ✅ Manage users
- ✅ Create discount coupons
- ✅ Moderate reviews

### As Student:
- ✅ Browse courses
- ✅ View course details
- ✅ Track learning progress
- ✅ Leave reviews

## 🆘 Having Issues?

### Database Connection Error?
Make sure PostgreSQL is running:
- **Windows:** Check Services (services.msc)
- **Mac:** `brew services start postgresql@14`
- **Linux:** `sudo systemctl start postgresql`

### Port 3000 Already in Use?
```bash
# Kill the process and try again
npx kill-port 3000
npm run dev
```

### Prisma Error?
```bash
npm run db:generate
```

## 🎨 Customize Your Platform

1. **Change Colors:** Edit `tailwind.config.ts`
2. **Update Logo:** Modify components in `src/components/navbar.tsx`
3. **Add Courses:** Use the admin panel or edit `prisma/seed.ts`

## 🔧 Optional: Add Payment & Video

### Stripe (for payments):
1. Get free test keys from https://stripe.com
2. Add to `.env`:
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Cloudflare Stream (for videos):
1. Sign up at https://cloudflare.com
2. Add to `.env`:
```env
CLOUDFLARE_ACCOUNT_ID="your-id"
CLOUDFLARE_STREAM_API_TOKEN="your-token"
```

---

**🎉 Enjoy building with QdeehAi!**
