# QdeehAi Setup Guide

This guide will walk you through setting up the QdeehAi project from scratch.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **npm, yarn, or pnpm** (comes with Node.js)

## Step-by-Step Setup

### 1. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE qdeeh_ai;

# Create user (optional)
CREATE USER qdeeh_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE qdeeh_ai TO qdeeh_user;
```

3. Your database URL will be:
```
postgresql://qdeeh_user:your_password@localhost:5432/qdeeh_ai
```

#### Option B: Cloud Database (Recommended for Production)

Use one of these cloud providers:
- [Supabase](https://supabase.com/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)
- [Railway](https://railway.app/)
- [AWS RDS](https://aws.amazon.com/rds/)

### 2. Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in the environment variables:

#### Required Variables

```env
# Database - Replace with your actual database URL
DATABASE_URL="postgresql://user:password@localhost:5432/eduplatform"

# NextAuth - Generate a secret key
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

#### Optional OAuth Providers

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`

```env
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

### 3. Stripe Setup

1. Create a [Stripe account](https://stripe.com/)
2. Get your API keys from the [Dashboard](https://dashboard.stripe.com/test/apikeys)

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

3. Set up webhooks:
   - Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
   - Add endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Video Service Setup

Choose **ONE** of the following:

#### Option A: Cloudflare Stream (Recommended)

1. Sign up for [Cloudflare](https://www.cloudflare.com/)
2. Go to Stream in your dashboard
3. Get your Account ID and create an API token

```env
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_STREAM_API_TOKEN="your-api-token"
```

#### Option B: Mux

1. Sign up for [Mux](https://www.mux.com/)
2. Create an access token from Settings > Access Tokens

```env
MUX_TOKEN_ID="your-token-id"
MUX_TOKEN_SECRET="your-token-secret"
```

### 5. Email Service Setup (Optional)

#### Resend (Recommended)

1. Sign up for [Resend](https://resend.com/)
2. Create an API key

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
```

#### SendGrid Alternative

```env
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@yourdomain.com"
```

### 6. Redis Setup (Optional)

For caching and rate limiting:

1. Sign up for [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy the REST URL and token

```env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 7. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 8. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# Seed database with sample data
npm run db:seed
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Student user: `student@example.com` / `student123`
- Sample courses and categories
- Sample reviews and coupons

### 9. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 10. Access Admin Panel

Navigate to: [http://localhost:3000/admin-dashboard-secret](http://localhost:3000/admin-dashboard-secret)

Login with: `admin@example.com` / `admin123`

## Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall settings

**Error: "Database does not exist"**
- Create the database manually
- Run `npm run db:push` again

### Prisma Issues

**Error: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Error: "Migration failed"**
```bash
# Reset database (WARNING: This will delete all data)
npx prisma migrate reset
```

### NextAuth Issues

**Error: "Missing NEXTAUTH_SECRET"**
```bash
# Generate a secret
openssl rand -base64 32
```

**OAuth not working**
- Check redirect URIs match exactly
- Verify client IDs and secrets
- Check OAuth app is not in development mode

### Stripe Webhook Issues

**Webhooks not receiving events**
- Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Video Upload Issues

**Upload fails**
- Check API credentials are correct
- Verify file size limits
- Check network connection

## Next Steps

1. **Customize branding**: Update logo, colors, and text
2. **Configure email templates**: Edit email content in code
3. **Set up domain**: Configure custom domain
4. **Add SSL certificate**: Use Let's Encrypt or Cloudflare
5. **Configure backups**: Set up automated database backups
6. **Set up monitoring**: Use Sentry, LogRocket, or similar
7. **Test payment flow**: Use Stripe test cards
8. **Create real courses**: Add your actual course content

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Getting Help

- Check the [README.md](./README.md) for general information
- Review [Next.js documentation](https://nextjs.org/docs)
- Check [Prisma documentation](https://www.prisma.io/docs)
- Open an issue on GitHub

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma Client
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript types
```

## Environment Variables Checklist

Use this checklist to ensure all required variables are set:

- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Video service credentials (Cloudflare or Mux)
- [ ] Email service credentials (optional)
- [ ] OAuth credentials (optional)
- [ ] Redis credentials (optional)

---

You're all set! 🎉 Start building your educational platform!
