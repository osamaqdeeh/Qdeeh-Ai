# 🚀 Production Deployment Checklist

## Before Deploying

- [ ] Code builds successfully: `npm run build` ✅
- [ ] All environment variables configured
- [ ] Database connection string ready (production)
- [ ] Video service chosen (GitHub/Cloudflare/Mux)
- [ ] NEXTAUTH_SECRET generated (32+ characters)

## Vercel Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Connect to Vercel
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository

### 3. Configure Environment Variables

**Required:**
```env
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-production-secret-32-chars-min
NEXTAUTH_URL=https://yourdomain.vercel.app
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

**Video Service (choose one):**

**Option A: GitHub (FREE)**
```env
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=video-storage
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_BRANCH=main
```

**Option B: Cloudflare Stream**
```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_STREAM_API_TOKEN=your-token
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id
```

**Option C: Mux**
```env
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Visit your deployed URL

### 5. Initialize Database
```bash
# Connect to Vercel CLI
npx vercel env pull

# Run migrations
npx prisma db push

# Seed database
npx prisma db seed
```

### 6. Test Everything

- [ ] Visit your production URL
- [ ] Login as admin
- [ ] Upload a test video
- [ ] Verify video plays
- [ ] Test course enrollment
- [ ] Test payment (if using Stripe)

## Custom Domain Setup (Optional)

1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables:
```env
NEXTAUTH_URL=https://yourcustomdomain.com
NEXT_PUBLIC_APP_URL=https://yourcustomdomain.com
```

## Post-Deployment

- [ ] Change admin password
- [ ] Configure email service (optional)
- [ ] Setup monitoring
- [ ] Test all features
- [ ] Invite test users

## Troubleshooting

**Build fails:**
- Check Vercel build logs
- Verify all dependencies installed
- Check TypeScript errors

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check database allows external connections
- Try adding `?sslmode=require` to connection string

**Video upload fails:**
- Check video service credentials
- Verify NEXT_PUBLIC_APP_URL matches your domain
- Check browser console for errors

**Authentication fails:**
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Clear browser cookies and try again

---

✅ **All fixes applied - Your app is production-ready!**
