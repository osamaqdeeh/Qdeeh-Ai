# 🚀 Automatic Deployment Guide - Deploy Your Website, Not Just README!

This guide will help you automatically deploy your **actual website** (not just README.md) to the internet whenever you push to GitHub.

## 🎯 Important: Why Not GitHub Pages?

Your project is a **Next.js application** with:
- Server-side rendering (SSR)
- API routes for payments, authentication, video uploads
- Database connections (Prisma)
- Dynamic server actions

**GitHub Pages only supports static HTML** - it cannot run your server-side code. Instead, we'll use **Vercel** (free and built by the Next.js team).

---

## ✅ Option 1: Vercel (RECOMMENDED - Free & Automatic)

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** and choose **"Continue with GitHub"**
3. After signing in, click **"Add New Project"**
4. Select your repository: `osamaqdeeh/Qdeeh_Ai`
5. Vercel will auto-detect Next.js - click **"Deploy"**

### Step 3: Configure Environment Variables
In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these variables (copy from your `.env` file):

```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-project.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### Step 4: Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **"Redeploy"**

### 🎉 Done! Your Website is Live!

**From now on:**
- Every `git push` to `main` branch = Automatic deployment
- Vercel gives you a URL like: `https://qdeeh-ai.vercel.app`
- You can also add a custom domain (free)

---

## 🔧 Option 2: GitHub Actions + Your Own Server

If you want more control, use GitHub Actions to auto-deploy to your own server:

### Step 1: Create GitHub Action
Already configured in `.github/workflows/deploy.yml`

### Step 2: Add GitHub Secrets
Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
- `SERVER_HOST` - Your server IP
- `SERVER_USER` - SSH username
- `SERVER_SSH_KEY` - Your private SSH key
- All environment variables from `.env`

### Step 3: Enable Actions
GitHub Actions will automatically deploy on every push to `main`.

---

## 📊 Comparison

| Feature | Vercel | GitHub Pages | Self-Hosted |
|---------|--------|--------------|-------------|
| **Next.js Support** | ✅ Full | ❌ No | ✅ Full |
| **API Routes** | ✅ Yes | ❌ No | ✅ Yes |
| **Database** | ✅ Yes | ❌ No | ✅ Yes |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ⚠️ Manual setup |
| **Cost** | 🆓 Free | 🆓 Free | 💰 Server costs |
| **SSL/HTTPS** | ✅ Auto | ✅ Auto | ⚠️ Manual |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free |

---

## 🌐 What Gets Deployed?

When you deploy, users will see:
- ✅ **Your actual website** - Homepage, courses, checkout, dashboard
- ✅ **Working features** - Login, payments, video playback
- ✅ **Admin panel** - Course management, analytics
- ❌ **NOT the README.md** - That's only for developers on GitHub

---

## 🔄 Workflow After Setup

```bash
# 1. Make changes to your code
# 2. Commit changes
git add .
git commit -m "Add new feature"

# 3. Push to GitHub
git push origin main

# 4. Vercel automatically:
#    - Detects the push
#    - Builds your project
#    - Deploys to production
#    - Updates your live website
#    - Takes ~2 minutes
```

---

## 🎨 Custom Domain (Optional)

### Free with Vercel:
1. Go to Vercel → **Settings** → **Domains**
2. Add your domain (e.g., `qdeeh.ai`)
3. Update DNS records as shown
4. Wait 5-10 minutes for DNS propagation

---

## 🐛 Troubleshooting

### Build Fails on Vercel?
1. Check **Build Logs** in Vercel dashboard
2. Most common issues:
   - Missing environment variables
   - Database connection errors
   - TypeScript errors

### Solution:
```bash
# Test build locally first
npm run build

# If it works locally, check Vercel environment variables
```

### Website Shows README Instead of App?
This only happens with GitHub Pages. **Solution: Use Vercel instead!**

GitHub Pages is for static sites only - it can't run your Next.js server.

---

## 📱 Monitor Deployments

### Vercel Dashboard:
- **Deployments** - See all deployments
- **Analytics** - View traffic and performance  
- **Logs** - Debug runtime errors
- **Domains** - Manage custom domains

### GitHub:
- Go to **Actions** tab to see deployment status
- Green checkmark = Successful deployment
- Red X = Failed deployment (click for logs)

---

## 🔐 Security Notes

1. **Never commit `.env` file** - Already in `.gitignore` ✅
2. **Use environment variables** in Vercel for secrets
3. **Enable Vercel Authentication** for preview deployments
4. **Update NEXTAUTH_URL** to your production URL

---

## 🚀 Next Steps

After deployment:
1. ✅ Test your live website thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Configure Stripe webhook with live URL
4. ✅ Update Google OAuth redirect URLs
5. ✅ Enable production database
6. ✅ Monitor with Vercel Analytics

---

## 💡 Pro Tips

- **Preview Deployments**: Every pull request gets its own preview URL
- **Rollback**: Instantly rollback to any previous deployment
- **Edge Functions**: Vercel runs your API routes globally for speed
- **Zero Config**: No server management needed
- **Free SSL**: Automatic HTTPS for all domains

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub Issues**: Report bugs in your repo

---

**Remember**: Your website will be at `https://your-project.vercel.app`, NOT `github.com/username/repo` (that's just the code repository).

Happy Deploying! 🎉
