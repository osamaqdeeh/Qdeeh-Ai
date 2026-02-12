# 🚀 Complete Vercel Deployment Guide

## ✅ CODE FIXES APPLIED

Your code has been updated to handle missing environment variables during build time. This means:
- ✅ Build will now succeed even without DATABASE_URL
- ✅ Pages will render dynamically at runtime
- ✅ Graceful fallbacks for missing database connection

---

## 📋 DEPLOYMENT STEPS

### Step 1: Deploy to Vercel (First Time)

1. **Push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Add dynamic rendering for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import from GitHub: `osamaqdeeh/Qdeeh-Ai`
   - Framework Preset: **Next.js** (auto-detected)
   - **DO NOT add environment variables yet**
   - Click **"Deploy"**

3. **Wait for deployment** (2-3 minutes)
   - Build will succeed ✅
   - You'll get a URL like: `https://qdeeh-ai.vercel.app`
   - Site will load but database features won't work yet

---

### Step 2: Set Up Your Database

You need a PostgreSQL database. Choose one option:

#### Option A: Neon (Recommended - FREE)
1. Go to: https://neon.tech
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

#### Option B: Supabase (FREE)
1. Go to: https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy the connection string under "Connection pooling"

#### Option C: Railway (FREE tier available)
1. Go to: https://railway.app
2. Create PostgreSQL database
3. Copy the DATABASE_URL from variables

---

### Step 3: Add Environment Variables in Vercel

1. **Go to your Vercel project:**
   - Dashboard → Your Project → Settings → Environment Variables

2. **Add each variable below:**

#### 🔴 REQUIRED - Database

| Variable Name | Value | Example |
|--------------|-------|---------|
| `DATABASE_URL` | Your PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 🔴 REQUIRED - Authentication

| Variable Name | Value | How to Get |
|--------------|-------|------------|
| `NEXTAUTH_SECRET` | Random 32+ character string | Generate at: https://generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | Your Vercel URL | Use: `https://qdeeh-ai.vercel.app` (your actual URL) |

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 🟡 RECOMMENDED - Google OAuth

Follow this guide: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

| Variable Name | Value | How to Get |
|--------------|-------|------------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Same as above |

**Important:** Add this redirect URI in Google Console:
```
https://qdeeh-ai.vercel.app/api/auth/callback/google
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 🟡 RECOMMENDED - Stripe Payments

| Variable Name | Value | How to Get |
|--------------|-------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Stripe Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | Same as above |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Developers → Webhooks |

**For Stripe Webhook:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://qdeeh-ai.vercel.app/api/webhooks/stripe`
4. Events to listen: `checkout.session.completed`, `payment_intent.succeeded`
5. Copy the signing secret

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 🟢 OPTIONAL - Video Hosting (GitHub - FREE)

| Variable Name | Value | How to Get |
|--------------|-------|------------|
| `GITHUB_REPO_OWNER` | Your GitHub username | e.g., `osamaqdeeh` |
| `GITHUB_REPO_NAME` | Repository for videos | e.g., `video-storage` |
| `GITHUB_TOKEN` | Personal Access Token | GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token |
| `GITHUB_BRANCH` | Branch name | Usually `main` |

**GitHub Token Permissions:**
- ✅ `repo` (Full control of private repositories)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 🟢 OPTIONAL - App Configuration

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://qdeeh-ai.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `QdeehAi` |
| `ADMIN_EMAIL` | Your admin email |

**Environments:** ✅ Production

---

### Step 4: Initialize Database Schema

After adding `DATABASE_URL`:

1. **Install Vercel CLI locally:**
   ```bash
   npm i -g vercel
   ```

2. **Link to your project:**
   ```bash
   vercel link
   ```

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```

4. **Run database migration:**
   ```bash
   npx prisma db push
   ```

5. **Seed database (optional):**
   ```bash
   npx prisma db seed
   ```

---

### Step 5: Redeploy

After adding ALL required environment variables:

1. Go to: **Deployments** tab in Vercel
2. Find the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Check "Use existing Build Cache" ❌ (uncheck it)
6. Click **"Redeploy"**
7. Wait 2-3 minutes

---

## 🎯 POST-DEPLOYMENT CHECKLIST

After redeployment, test these features:

- [ ] Homepage loads without errors
- [ ] Can sign up with email/password
- [ ] Can sign in with Google (if configured)
- [ ] Courses page displays courses
- [ ] Admin dashboard is accessible
- [ ] Can upload videos (if GitHub/Mux configured)
- [ ] Payment works (if Stripe configured)

---

## 🔧 TROUBLESHOOTING

### Build still fails?
- Make sure you pushed the latest code changes to GitHub
- Check that `dynamic = 'force-dynamic'` is in `src/app/page.tsx`

### "Database not available" errors?
- Verify `DATABASE_URL` is added in Vercel
- Make sure it's added to all environments (Production, Preview, Development)
- Check connection string format is correct

### Authentication not working?
- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- Make sure `NEXTAUTH_URL` matches your actual Vercel URL
- For Google OAuth, check redirect URI is correct in Google Console

### Stripe webhook not working?
- Make sure webhook endpoint URL is: `https://your-domain.vercel.app/api/webhooks/stripe`
- Verify webhook secret (`STRIPE_WEBHOOK_SECRET`) is correct
- Check webhook is listening to correct events

---

## 📊 Environment Variables Summary

**Minimum to deploy:**
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`

**For full functionality:**
- ✅ All above
- ✅ `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- ✅ `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET`

**For video uploads:**
- ✅ `GITHUB_TOKEN` + `GITHUB_REPO_OWNER` + `GITHUB_REPO_NAME`
- OR `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET`
- OR `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_STREAM_API_TOKEN`

---

## 🎉 SUCCESS!

Once redeployed with all environment variables:
- ✅ Your site will be fully functional
- ✅ Database queries will work
- ✅ Authentication will work
- ✅ Payments will work
- ✅ All features enabled!

---

## 📞 Need Help?

Common issues are usually:
1. Missing environment variables
2. Wrong environment variable values
3. Typos in variable names
4. Not redeploying after adding variables

**Remember:** Every time you add/change environment variables, you must **redeploy**!

---

## 🔄 Quick Commands Reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or visit:
https://generate-secret.vercel.app/32

# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull env vars
vercel env pull .env.local

# Push database schema
npx prisma db push

# Seed database
npx prisma db seed

# Check deployment logs
vercel logs
```

---

**Last Updated:** 2026-02-12
**Your Repo:** https://github.com/osamaqdeeh/Qdeeh-Ai
