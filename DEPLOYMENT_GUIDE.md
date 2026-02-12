# 🚀 Deployment Guide - Localhost & Production

This guide explains how to deploy your video course platform on both **localhost** and **production** (Vercel, Netlify, or any hosting service).

---

## 📋 Table of Contents

1. [Environment Variables Setup](#environment-variables-setup)
2. [Video Service Configuration](#video-service-configuration)
3. [Localhost Deployment](#localhost-deployment)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 Environment Variables Setup

### Required for All Environments

```env
# Database
DATABASE_URL="your-database-connection-string"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"  # Update for production

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Update for production
```

### For Localhost
```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### For Production (e.g., Vercel)
```env
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### For Vercel (Auto-Detection)
You can leave `NEXT_PUBLIC_APP_URL` empty on Vercel - the app will automatically use `VERCEL_URL`:
```env
# NEXT_PUBLIC_APP_URL=""  # Optional on Vercel
NEXTAUTH_URL="https://yourdomain.com"
```

---

## 🎥 Video Service Configuration

Choose ONE of these video hosting options:

### Option 1: GitHub (FREE - Recommended for Development)

```env
# GitHub Video Storage (FREE!)
GITHUB_REPO_OWNER="your-github-username"
GITHUB_REPO_NAME="your-repo-name"
GITHUB_TOKEN="your-github-personal-access-token"
GITHUB_BRANCH="main"
```

**Setup Steps:**
1. Create a GitHub Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control)
   - Copy the token

2. Set the environment variables above

**Limitations:**
- 100MB per file (use Git LFS for larger files)
- Good for small to medium videos
- Free forever!

### Option 2: Cloudflare Stream (Production-Ready)

```env
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
CLOUDFLARE_STREAM_API_TOKEN="your-api-token"
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
```

**Pricing:** $1 per 1000 minutes stored, $1 per 1000 minutes delivered

### Option 3: Mux (Enterprise)

```env
MUX_TOKEN_ID="your-mux-token-id"
MUX_TOKEN_SECRET="your-mux-token-secret"
```

**Pricing:** $0.005 per minute encoded, $0.01 per GB delivered

---

## 💻 Localhost Deployment

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Choose one video service (GitHub is easiest for localhost)
GITHUB_REPO_OWNER="your-username"
GITHUB_REPO_NAME="your-repo"
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
GITHUB_BRANCH="main"
```

### 4. Setup Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

**Admin Login:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 🌍 Production Deployment

### Vercel Deployment (Recommended)

#### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard

#### 3. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# Database (use production database)
DATABASE_URL="postgresql://user:password@host:5432/production_db"

# NextAuth
NEXTAUTH_SECRET="production-secret-min-32-chars"
NEXTAUTH_URL="https://yourdomain.com"

# App URL (can be empty, Vercel auto-detects)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Video Service (choose one)
# GitHub
GITHUB_REPO_OWNER="your-username"
GITHUB_REPO_NAME="your-repo"
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"

# OR Cloudflare
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_STREAM_API_TOKEN="your-token"
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID="your-account-id"

# OR Mux
MUX_TOKEN_ID="your-token-id"
MUX_TOKEN_SECRET="your-token-secret"

# Optional: Payment (Stripe)
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"

# Optional: OAuth
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
GITHUB_ID="xxxxx"
GITHUB_SECRET="xxxxx"
```

#### 4. Deploy

Click "Deploy" - Vercel will:
1. Build your Next.js app
2. Run database migrations
3. Deploy to production URL

#### 5. Run Database Seed (One Time)

In Vercel dashboard:
1. Go to your project → Settings → Functions
2. Or connect via Vercel CLI:

```bash
vercel env pull
npx prisma db push
npx prisma db seed
```

---

## 🐛 Troubleshooting

### Issue: Video Upload Returns 404

**Problem:** Missing API route for video status check

**Solution:** ✅ Fixed! Created `src/app/api/upload/video/status/route.ts`

### Issue: CORS Errors with Video Upload

**Problem:** Mux/Cloudflare rejecting uploads due to wrong origin

**Solution:** ✅ Fixed! Dynamic CORS origin detection:
- Localhost: Uses `http://localhost:3000`
- Vercel: Uses `VERCEL_URL` automatically
- Custom domain: Uses `NEXT_PUBLIC_APP_URL`

### Issue: GitHub Video URLs Not Working

**Problem:** Incorrect URL construction for GitHub raw content

**Solution:** ✅ Fixed! Proper URL construction:
```typescript
https://raw.githubusercontent.com/owner/repo/branch/videos/filename.mp4
```

### Issue: Environment Variables Not Working

**Checklist:**
- [ ] `.env` file exists in root directory
- [ ] No quotes around values (unless needed)
- [ ] Restart dev server after changes
- [ ] For Vercel: Set in dashboard, redeploy

### Issue: Database Connection Fails

**Localhost:**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

**Production:**
- Verify database is accessible from Vercel
- Check firewall rules
- Verify SSL settings (add `?sslmode=require` if needed)

### Issue: Admin Can't Upload Videos

**Checklist:**
- [ ] Logged in as admin user
- [ ] At least one course created
- [ ] Video service configured (GitHub/Cloudflare/Mux)
- [ ] Environment variables set correctly

### Issue: Videos Don't Play

**GitHub:**
- URL format: `https://raw.githubusercontent.com/owner/repo/branch/videos/file.mp4`
- Check file size < 100MB
- Verify repository is public or token is valid

**Cloudflare:**
- Check account ID is correct
- Verify API token has permissions
- Wait for video processing (can take 1-2 minutes)

**Mux:**
- Wait for asset processing
- Check status endpoint: `/api/upload/video/status?uploadId=xxx`

---

## 📝 Quick Reference

### Localhost URLs
- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin-dashboard-secret`
- API: `http://localhost:3000/api/*`

### Production URLs
- App: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin-dashboard-secret`
- API: `https://yourdomain.com/api/*`

### Important Files
- Environment: `.env` (local), Vercel Dashboard (production)
- Database schema: `prisma/schema.prisma`
- API routes: `src/app/api/**`
- Video services: `src/lib/video/**`

---

## ✅ Deployment Checklist

Before going to production:

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Use production database (not localhost)
- [ ] Generate new `NEXTAUTH_SECRET` (32+ chars)
- [ ] Configure video service (GitHub/Cloudflare/Mux)
- [ ] Test video upload on production
- [ ] Test video playback on production
- [ ] Configure custom domain (if using)
- [ ] Enable SSL/HTTPS
- [ ] Run database migrations
- [ ] Seed admin user
- [ ] Test payment flow (if using Stripe)
- [ ] Configure OAuth providers (if using)

---

## 🎯 Next Steps

1. **Test locally first** - Make sure everything works on localhost
2. **Choose video service** - GitHub (free), Cloudflare (good), or Mux (best)
3. **Deploy to Vercel** - Easiest deployment platform
4. **Configure domain** - Point your custom domain to Vercel
5. **Go live!** - Your video course platform is ready!

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review error logs:
   - Localhost: Check terminal
   - Vercel: Check Functions logs in dashboard
3. Verify all environment variables are set correctly
4. Make sure database is accessible
5. Test with a small video file first

---

**🎉 Happy Deploying!**
