# Biraj.HR - Professional Marketplace Platform

A production-ready marketplace with integrated payment processing, subscriptions, invoicing, and comprehensive admin analytics.

**Status**: Production-Ready ✅  
**Last Updated**: August 19, 2026  
**Version**: 1.0.0

---

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### Environment Setup
```bash
# Copy example environment
cp .env.example .env

# Fill in your keys (development keys work locally)
# Development Stripe keys: pk_test_* and sk_test_*
```

---

## 📋 Features

### Payment Processing
- ✅ One-time payments via Stripe
- ✅ Recurring subscriptions (monthly/yearly)
- ✅ Automatic invoice generation
- ✅ Refund request system
- ✅ Payment history and receipts
- ✅ Stored payment methods

### User Experience
- ✅ Secure checkout flow
- ✅ Email confirmations (Resend)
- ✅ Mobile-responsive design
- ✅ Real-time payment status
- ✅ Invoice PDFs
- ✅ Subscription management

### Admin Dashboard
- ✅ Revenue analytics and trends
- ✅ Payment status breakdown
- ✅ Refund queue management
- ✅ Order history with filtering
- ✅ Real-time statistics

### Infrastructure
- ✅ Vercel deployment ready
- ✅ GitHub Actions CI/CD
- ✅ Sentry error tracking
- ✅ Supabase database with RLS
- ✅ Automated backups
- ✅ Performance monitoring

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TanStack Router
- **Backend**: TanStack React Start + Stripe
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Hosting**: Vercel
- **Monitoring**: Sentry
- **Styling**: Tailwind CSS + shadcn/ui

### Project Structure
```
├── src/
│   ├── routes/              # Page components
│   │   ├── admin/          # Admin dashboard
│   │   ├── racun/          # Account/payment pages
│   │   └── api/            # Backend functions
│   ├── lib/                # Utilities & configs
│   ├── components/         # Reusable components
│   └── styles/             # Global styles
├── supabase/
│   └── migrations/         # Database schema
├── .github/
│   └── workflows/          # CI/CD pipelines
└── public/                 # Static assets
```

---

## 📚 Documentation

### Deployment & Setup
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Complete Vercel deployment guide
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Infrastructure, monitoring, CI/CD setup
- **[GO_LIVE_CHECKLIST.md](GO_LIVE_CHECKLIST.md)** - 8-day launch plan with 120+ verification items

### Development Guides
- **[TESTING.md](TESTING.md)** - Complete testing guide with test cards and payment flows
- **[FEATURES.md](FEATURES.md)** - Feature documentation and database schema
- **[API.md](API.md)** - API reference for all functions
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - System architecture and design decisions

---

## 🔐 Security

- **Row-Level Security (RLS)** - All database tables protected
- **Webhook Verification** - Stripe signature validation
- **API Key Protection** - Environment-based secrets
- **Password Security** - Supabase Auth with bcrypt
- **PCI Compliance** - No card data stored (Stripe tokenized)
- **HTTPS Only** - All traffic encrypted

---

## 📊 Database Schema

### Core Tables
- `profiles` - User accounts
- `listings` - Marketplace listings
- `promotion_orders` - One-time payment records
- `subscription_orders` - Recurring subscription records
- `refund_requests` - Refund request tracking
- `payment_methods` - Stored credit cards
- `invoices` - Auto-generated invoices

### Security
- All tables have RLS policies
- Users can only access own data
- Admins have full access
- Automatic encryption at rest

---

## 🔧 Environment Variables

### Required for Development
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=xxxxx
SUPABASE_PUBLISHABLE_KEY=xxxxx
SUPABASE_PROJECT_ID=xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
RESEND_API_KEY=re_xxxxx
VITE_APP_URL=http://localhost:5173
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Production Variables (Vercel)
Same variables with production keys (pk_live_, sk_live_)

See `.env.example` for all options.

---

## 🚢 Deployment

### Automatic (GitHub Push)
1. Push to `main` branch
2. GitHub Actions runs tests
3. Vercel deploys automatically
4. Domain updates in ~3 minutes

### Manual (Vercel CLI)
```bash
vercel --prod
```

See **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** for complete setup.

---

## 📈 Monitoring

### Error Tracking (Sentry)
- Automatic error capture
- Performance monitoring
- Session replay
- Alert notifications

### Logs
- Vercel: `vercel logs --tail`
- Database: Supabase Dashboard → Logs
- Stripe: Webhook delivery logs
- Email: Resend Dashboard

### Dashboards
- Admin: `/admin/dashboard` - Real-time analytics
- Stripe: Payments overview
- Supabase: Query performance
- Vercel: Build & deployment logs

---

## 🧪 Testing

### Local Testing
```bash
# Run linting
npm run lint

# Build locally
npm run build

# Test payment flow with test cards
# See TESTING.md for full guide
```

### Test Cards
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- See [TESTING.md](TESTING.md) for more scenarios

### Stripe CLI
```bash
# Listen to webhooks locally
stripe listen --forward-to localhost:5173/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

---

## 📞 Support & Maintenance

### Daily Operations
- Monitor error tracking (Sentry)
- Check payment logs (Stripe)
- Verify email delivery (Resend)

### Weekly Tasks
- Review analytics dashboard
- Check refund queue
- Monitor database performance
- Update dependencies if needed

### Monthly Tasks
- Security audit
- Performance review
- Cost analysis
- Backup verification

---

## 🛠️ Common Tasks

### Add New Payment Tier
1. Create tier in Stripe Product Catalog
2. Update tier map in checkout handler
3. Deploy and test

### Process Refund
1. Admin views `/admin/refunds`
2. Click "Approve Refund"
3. Stripe refund processed automatically
4. Customer receives confirmation email

### View Payment History
Users: `/racun/placanja`
Admin: `/admin/dashboard`

### Download Invoice
Users: `/racun/racuni` → Click "Download"
Format: PDF with company details and itemization

---

## 🚨 Troubleshooting

### Payment Not Processing
1. Check Stripe webhook logs
2. Verify API keys (pk_live vs pk_test)
3. Check browser console for errors
4. Review Sentry for exceptions

### Email Not Sending
1. Verify Resend API key
2. Check Resend dashboard for bounces
3. Verify domain is verified
4. Check sender address (noreply@biraj.hr)

### Database Connection Error
1. Verify Supabase project is running
2. Check RLS policies are enabled
3. Verify credentials in environment
4. Check network/firewall rules

See **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** troubleshooting section.

---

## 📊 System Status

### Production Infrastructure
- ✅ Vercel Deployment
- ✅ Supabase Database
- ✅ Stripe Payments
- ✅ Resend Email
- ✅ Sentry Monitoring
- ✅ GitHub Actions CI/CD

### Feature Completion
- ✅ One-time Payments
- ✅ Subscriptions
- ✅ Invoicing
- ✅ Refunds
- ✅ Payment Methods
- ✅ Admin Dashboard
- ✅ Analytics
- ✅ Error Tracking

---

## 🎯 Next Steps

### Before Launch
1. Follow **[GO_LIVE_CHECKLIST.md](GO_LIVE_CHECKLIST.md)**
2. Complete 8-day launch plan
3. Verify 120+ checklist items
4. Train support team

### After Launch
1. Monitor first 24 hours closely
2. Review Sentry for errors
3. Collect user feedback
4. Iterate on improvements

---

## 📄 License

Private Repository - Biraj.HR Team

---

## 👥 Team

**Project**: Biraj.HR Marketplace  
**Maintained by**: Development Team  
**Last Updated**: August 19, 2026  
**Version**: 1.0.0

---

## 🔗 Resources

- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Sentry Docs**: https://docs.sentry.io
- **Resend Docs**: https://resend.com/docs

---

## ✨ Ready for Production

This codebase is production-ready with:
- ✅ Complete payment system
- ✅ Error tracking
- ✅ Automated CI/CD
- ✅ Performance optimization
- ✅ Security hardening
- ✅ Comprehensive documentation

**Ready to deploy**: Follow [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) and [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
