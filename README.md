# QdeehAi - AI-Powered Educational Platform

A modern full-stack educational platform built with the latest technologies, featuring AI-powered learning, course management, video streaming, payment processing, and comprehensive admin controls.

## 🚀 Features

### Public Features
- **Landing Page** with animated hero section, statistics, and testimonials
- **Course Catalog** with advanced filtering (category, level, price, rating)
- **Course Details** with curriculum, reviews, and instructor information
- **Responsive Design** with dark/light mode support
- **SEO Optimized** with metadata and Open Graph tags

### Student Features
- **User Dashboard** with enrollment tracking and progress visualization
- **Course Player** with custom video controls and progress tracking
- **Certificate Generation** upon course completion
- **Review System** to rate and review courses
- **Note-Taking** feature during video lessons

### Admin Panel (`/admin-dashboard-secret`)
- **Dashboard Overview** with revenue charts and analytics
- **Course Management** with drag-and-drop video upload
- **User Management** with search, filters, and bulk actions
- **Coupon System** with discount codes and usage tracking
- **Review Moderation** to approve/reject student reviews
- **Analytics & Reporting** with revenue and enrollment insights
- **Settings** for platform configuration

### Payment & Enrollment
- **Stripe Integration** for secure payments
- **Coupon System** with percentage and fixed discounts
- **Webhook Handling** for automated enrollment
- **Payment History** tracking

### Video & Streaming
- **Cloudflare Stream** or **Mux** integration
- **Secure Video Playback** with signed URLs
- **Custom Video Player** with playback controls
- **Progress Tracking** and resume functionality
- **Video Encryption** and DRM protection

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** (App Router) with React 19
- **TypeScript** for type safety
- **Tailwind CSS** + shadcn/ui for modern UI
- **React Query** (TanStack Query) for data fetching
- **Zustand** for state management
- **Framer Motion** for animations
- **React Hook Form** + Zod for form validation

### Backend
- **Next.js API Routes** (App Router)
- **Prisma ORM** with PostgreSQL
- **NextAuth.js v5** for authentication
- **Server Actions** for server-side logic

### Services
- **Stripe** for payments
- **Cloudflare Stream** or **Mux** for video hosting
- **Cloudflare R2** or **AWS S3** for file storage
- **Resend** or **SendGrid** for emails
- **Upstash Redis** for caching

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn or pnpm

### 1. Clone the repository
```bash
git clone <repository-url>
cd qdeeh-ai
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/qdeeh_ai"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Video Service (Choose one)
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_STREAM_API_TOKEN=""
# OR
MUX_TOKEN_ID=""
MUX_TOKEN_SECRET=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# Redis (Optional)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### 4. Set up the database
```bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Default Credentials

After seeding the database, you can use these credentials:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Student Account:**
- Email: `student@example.com`
- Password: `student123`

**Admin Panel:** [http://localhost:3000/admin-dashboard-secret](http://localhost:3000/admin-dashboard-secret)

## 📁 Project Structure

```
qdeeh-ai/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── src/
│   ├── app/
│   │   ├── (main)/            # Public pages (landing, courses)
│   │   ├── (dashboard)/       # Student dashboard
│   │   ├── (admin)/           # Admin panel
│   │   ├── api/               # API routes
│   │   ├── auth/              # Auth pages (signin, signup)
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── admin/             # Admin components
│   │   ├── courses/           # Course-related components
│   │   └── home/              # Homepage components
│   ├── lib/
│   │   ├── actions/           # Server actions
│   │   ├── video/             # Video service integrations
│   │   ├── auth-helpers.ts    # Authentication utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── stripe.ts          # Stripe client
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🎨 Key Features Breakdown

### Authentication
- Email/Password authentication
- OAuth (Google, GitHub)
- Email verification
- Password reset
- Role-based access control (Student/Admin)

### Course Management
- Rich text editor for descriptions
- Video upload with progress tracking
- Section and lesson organization
- Drag-and-drop curriculum builder
- SEO metadata management

### Payment Processing
- Secure Stripe checkout
- Webhook handling for automation
- Coupon code validation
- Payment history tracking
- Refund support

### Video Streaming
- Cloudflare Stream or Mux integration
- Signed URLs for security
- Adaptive bitrate streaming
- Thumbnail generation
- Progress tracking

### Admin Analytics
- Revenue charts (daily, monthly, yearly)
- Student enrollment trends
- Course performance metrics
- User activity logs
- Export to CSV/PDF

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
Make sure to set all environment variables in your hosting provider:
- Database URL (use a production PostgreSQL database)
- NextAuth secret (generate a new one)
- Stripe keys (use live keys)
- Video service credentials
- Email service API key

### Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy migration to production
npx prisma migrate deploy
```

## 🔒 Security Features

- **CSRF Protection** via NextAuth
- **XSS Prevention** with proper sanitization
- **SQL Injection Protection** via Prisma
- **Rate Limiting** on API endpoints
- **Secure Video URLs** with expiration
- **Content Security Policy** headers
- **Environment Variable Validation**

## 📊 Performance Optimizations

- Server-side rendering (SSR) for SEO
- Static generation for public pages
- Image optimization with next/image
- Code splitting and lazy loading
- Database query optimization
- CDN integration for assets
- Redis caching (optional)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📝 API Documentation

### Public API Endpoints
- `GET /api/courses` - Get all published courses
- `GET /api/courses/[id]` - Get course details
- `POST /api/auth/[...nextauth]` - Authentication

### Admin API Endpoints (Protected)
- `POST /api/upload/video` - Get video upload URL
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/[id]` - Update course
- `DELETE /api/admin/courses/[id]` - Delete course

### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment webhooks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe](https://stripe.com/)
- [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/)
- [Mux](https://www.mux.com/)

## 📧 Support

For support, email support@qdeeh.ai or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Live streaming classes
- [ ] Discussion forums
- [ ] Certificate verification system
- [ ] Affiliate program
- [ ] Multi-language support
- [ ] Learning paths
- [ ] Gamification features
- [ ] Social learning features
- [ ] Advanced analytics dashboard

---

Built with ❤️ using Next.js 15, React 19, and modern web technologies.
