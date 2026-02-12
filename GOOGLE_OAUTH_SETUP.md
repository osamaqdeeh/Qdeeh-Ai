# 🔐 Google OAuth Setup Guide

## ✅ What Was Added

Your app now has **Google Sign-In** buttons on both signup and signin pages!

### Features:
- ✅ "Continue with Google" button on signup page
- ✅ "Continue with Google" button on signin page
- ✅ Beautiful Google logo and styling
- ✅ Automatic account creation for new users
- ✅ Seamless login for existing users
- ✅ Works alongside email/password authentication

---

## 🚀 Quick Start

### Option 1: Use Without Google OAuth (Email Only)
Your app works perfectly without Google OAuth setup. Users can:
- Sign up with email/password
- Sign in with email/password
- Everything works!

**No setup needed** - just start using the app!

### Option 2: Enable Google Sign-In (Recommended)
Follow the setup steps below to enable the Google button.

---

## 📋 Google OAuth Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select existing project
3. Give it a name (e.g., "QdeehAi Learning Platform")
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services" → "Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "OAuth client ID"**
3. Configure consent screen if prompted:
   - User Type: **External**
   - App name: **QdeehAi** (or your app name)
   - User support email: **your email**
   - Developer contact: **your email**
   - Click **"Save and Continue"**

4. Choose **"Web application"** as application type
5. Give it a name: **"QdeehAi Web Client"**

6. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```

7. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

8. Click **"Create"**

### Step 4: Get Your Credentials

After creating, you'll see a popup with:
- **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123xyz`)

**Copy both values!**

### Step 5: Add to .env File

Open your `.env` file and add:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

Replace with your actual values from Step 4.

### Step 6: Restart Development Server

```powershell
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 7: Test Google Sign-In

1. Go to http://localhost:3000/auth/signup
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. ✅ You're in! Redirected to dashboard

---

## 🎯 Production Setup

### For Production (when deploying):

1. Add production URL to Google Console:
   - **Authorized JavaScript origins**:
     ```
     https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://yourdomain.com/api/auth/callback/google
     ```

2. Update `.env` or environment variables:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

---

## 🔧 How It Works

### User Flow:

1. **New User Clicks "Continue with Google"**
   - Redirected to Google sign-in
   - User authorizes the app
   - Account created automatically in database
   - User redirected to dashboard
   - ✅ Signed up and logged in!

2. **Existing User Clicks "Continue with Google"**
   - Redirected to Google sign-in
   - User authorizes the app
   - Matched with existing account by email
   - User redirected to dashboard
   - ✅ Logged in!

### Database:
- OAuth users are created as **STUDENT** accounts
- Email is automatically verified
- Account linked to Google provider
- Can also set a password later for email login

---

## 🎨 What You See

### Signup Page:
```
┌─────────────────────────────────┐
│   📚 QdeehAi                    │
│   Create Account                │
│   Sign up to start learning     │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🔵 Continue with Google   │ │
│  └───────────────────────────┘ │
│                                 │
│  ─── Or continue with email ─── │
│                                 │
│  Name: [_______________]        │
│  Email: [_______________]       │
│  Password: [_______________]    │
│                                 │
│  [ Create Account ]             │
│                                 │
│  Already have an account?       │
│  Sign in                        │
└─────────────────────────────────┘
```

### Signin Page:
```
┌─────────────────────────────────┐
│   📚 QdeehAi                    │
│   Sign In                       │
│   Sign in with Google or email  │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🔵 Continue with Google   │ │
│  └───────────────────────────┘ │
│                                 │
│  ─── Or continue with email ─── │
│                                 │
│  Email: [_______________]       │
│  Password: [_______________]    │
│                                 │
│  [ Sign In ]                    │
│                                 │
│  Don't have an account?         │
│  Sign up                        │
└─────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### "Google button not working"
**Solution**: Check that you added credentials to `.env` file and restarted server

### "Redirect URI mismatch" error
**Solution**: Make sure redirect URI in Google Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

### "Access blocked: This app's request is invalid"
**Solution**: 
1. Configure OAuth consent screen in Google Console
2. Add your email as test user
3. Make sure you enabled the Google+ API

### "Cannot read properties of undefined (reading 'id')"
**Solution**: Make sure Prisma adapter is properly configured (already done!)

### Google button doesn't appear
**Solution**: 
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env`
- Restart dev server
- Clear browser cache

---

## ✅ Testing Checklist

- [ ] Google button appears on signup page
- [ ] Google button appears on signin page
- [ ] Clicking button redirects to Google
- [ ] After signing in with Google, redirected to dashboard
- [ ] User account created in database
- [ ] Can sign in again with same Google account
- [ ] Can also sign in with email/password if set

---

## 📊 Benefits of Google OAuth

### For Users:
- ✅ **Faster signup** - No need to create password
- ✅ **Easier login** - One-click sign-in
- ✅ **Secure** - Google handles authentication
- ✅ **Trusted** - Users already trust Google
- ✅ **No forgotten passwords** - Google remembers

### For You:
- ✅ **Higher conversion** - More users will sign up
- ✅ **Less support** - Fewer "forgot password" requests
- ✅ **Verified emails** - Google emails are verified
- ✅ **Professional** - Modern authentication
- ✅ **Secure** - Google's security infrastructure

---

## 🔐 Security Notes

### What Google Provides:
- User's email (verified)
- User's name
- User's profile picture
- Unique user ID

### What We DON'T Get:
- User's password (Google manages this)
- Access to user's Google account
- Any other Google data

### Privacy:
- Users must consent to share their info
- Users can revoke access anytime
- OAuth is industry-standard secure

---

## 💡 Additional Features (Optional)

### Want to add GitHub login too?
Similar process:
1. Create OAuth App on GitHub
2. Add credentials to `.env`:
   ```env
   GITHUB_ID="your-github-id"
   GITHUB_SECRET="your-github-secret"
   ```
3. Button will automatically appear!

Already configured in `src/auth.ts`!

---

## 📝 Summary

### What Changed:

**Files Modified:**
- ✅ `src/app/(auth)/auth/signup/page.tsx` - Added Google button
- ✅ `src/app/(auth)/auth/signin/page.tsx` - Added Google button
- ✅ `src/lib/actions/auth.ts` - Fixed validation (nullable fields)
- ✅ `.env.example` - Added Google OAuth instructions

**What Was Fixed:**
- ✅ Signup validation error ("Expected string, received null")
- ✅ Phone and country fields now properly optional
- ✅ Google OAuth fully integrated

**What You Get:**
- ✅ Beautiful Google sign-in buttons
- ✅ One-click authentication
- ✅ Professional user experience
- ✅ Works with or without Google OAuth setup

---

## 🚀 Ready to Use!

### Without Google OAuth:
```powershell
npm run dev
```
Email/password auth works perfectly!

### With Google OAuth:
1. Follow setup steps above
2. Add credentials to `.env`
3. Restart server
4. Test Google sign-in
5. ✅ Done!

---

**Questions?** Check the troubleshooting section or test without Google OAuth first!

**Status**: ✅ READY  
**Google Button**: ✅ ADDED  
**Validation**: ✅ FIXED  
**Setup Guide**: ✅ COMPLETE
