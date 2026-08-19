# Biraj.HR Setup Guide

## Prerequisites
- Node.js 18+
- Supabase account
- Stripe account
- Resend email service (optional)

---

## 1. Environment Setup

### Copy `.env.example` to `.env`:
```bash
cp .env.example .env.local
```

### Fill in Supabase credentials:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API → Copy:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_PROJECT_ID`

---

## 2. Database Migrations

The migrations in `supabase/migrations/` are automatically applied when deployed to Vercel.

For **local development**, run:
```bash
npm install supabase --save-dev
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase db push
```

---

## 3. Stripe Setup

### Get Test Keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Test Mode → API Keys
3. Copy:
   - `VITE_STRIPE_PUBLISHABLE_KEY` (Publishable key)
   - `STRIPE_SECRET_KEY` (Secret key)

### Setup Webhook:
1. Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Events to send: 
   - `checkout.session.completed`
   - `charge.failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy `Signing secret` → `STRIPE_WEBHOOK_SECRET`

**For local testing**, use Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:5173/api/webhooks/stripe
stripe trigger checkout.session.completed
```

---

## 3.5. Resend Setup (Email Notifications)

### Setup Email Service:
1. Go to [Resend Dashboard](https://resend.com)
2. Create account and verify domain (or use default)
3. API Keys → Create new key
4. Copy key → `RESEND_API_KEY`

### Email Templates:
- Payment confirmation sent automatically after successful payment
- Refund confirmation when refund is approved
- Subscription confirmation for recurring billing

---

## 4. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5173`

---

## 5. Test Payment Flow

1. Go to homepage
2. Click on any listing
3. Click "Promiraj oglas" (Promote listing)
4. Select tier (Spotlight, Featured, Premium, VIP)
5. Enter email
6. Click "Nastavi na Stripe"
7. Use test card: `4242 4242 4242 4242`
8. Any future expiry, any CVC

---

## 6. Vercel Deployment

### Set Environment Variables:
1. Vercel Dashboard → Settings → Environment Variables
2. Add all variables from `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_PROJECT_ID`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
   - `VITE_APP_URL` (your Vercel domain)

### Migrations:
- Migrations are automatically applied on deploy
- Check Supabase → Migrations to verify

### Webhook:
- Update Stripe webhook URL to: `https://your-vercel-domain.com/api/webhooks/stripe`

---

## 7. Project Structure

```
src/
├── routes/                    # TanStack Router pages
│   ├── checkout.promoted.$listingId.tsx       # Stripe checkout form (one-time)
│   ├── checkout.success.tsx                   # Payment confirmation
│   ├── checkout.cancel.tsx                    # Payment failure
│   ├── racun.placanja.tsx                     # Payment history
│   ├── racun.subscription.tsx                 # Manage subscriptions
│   ├── racun.subscription-potvrda.tsx         # Subscription confirmation
│   ├── racun.povrat-novca.tsx                 # Request refunds
│   ├── admin.dashboard.tsx                    # Admin analytics
│   └── index.tsx                              # Homepage (promoted listings)
├── lib/
│   ├── auth.tsx                              # Authentication (demo mode in dev)
│   ├── stripe.functions.ts                   # Stripe server functions (checkout & subscription)
│   ├── stripe.webhook.ts                     # Webhook handler
│   ├── email.functions.ts                    # Email notifications (Resend)
│   └── mock/data.ts                          # Mock data + pricing
└── api/
    └── webhooks/stripe.ts                    # Stripe webhook endpoint

supabase/
├── migrations/
│   ├── 20260819_promotion_system.sql        # Promotion schema
│   ├── 20260819_subscription_system.sql     # Subscription schema
│   └── 20260819_refund_system.sql           # Refund request system
```

---

## 8. Key Features

### Promotion Tiers (One-Time):
- **Spotlight**: €10/week
- **Featured**: €15/week
- **Premium**: €20/week
- **VIP**: €35/week

### Subscription Tiers (Recurring Monthly):
- **Standard**: €29.99/month (Spotlight equivalent)
- **Premium**: €79.99/month (Premium equivalent)
- Flexible: Monthly or Yearly billing

### Email Notifications (Resend):
- Payment confirmation after successful checkout
- Refund approval notifications
- Subscription management emails
- Custom HTML templates with branding

### Admin Dashboard (`/admin/dashboard`):
- Revenue analytics and charts
- Payment status breakdown
- Daily/weekly revenue trends
- Tier distribution analysis
- Recent payment table

### Refund Management (`/racun/povrat-novca`):
- Request refund with reason
- Track refund status
- Automatic email confirmation
- Admin approval workflow

### Subscription Management (`/racun/subscription`):
- View active subscriptions
- Track next billing date
- Cancel subscriptions
- Handle past-due payments
- View subscription history

### Database Tables:
- `promotion_orders` — One-time payment records
- `subscription_orders` — Recurring subscription records
- `refund_requests` — Refund request tracking
- `listings` — Has `promotion_tier`, `subscription_tier`, `subscription_active`

### RLS Policies:
- Users can only view/create their own orders
- Admins can view all orders and approve refunds
- Refund requests auto-create from order status changes

---

## 9. Troubleshooting

### "Invalid login credentials"
- Development: Demo login enabled (any email/password)
- Production: Must have Supabase auth user

### Webhook not receiving events?
- Check Stripe API Key (`STRIPE_SECRET_KEY`)
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Test with: `stripe trigger checkout.session.completed`

### Promotions not showing?
- Check `promotion_expires_at` is in future
- Verify `promotion_tier` is not "none"
- Check RLS policies on listings table

---

## 10. Implementation Status

### ✅ Completed:
1. **Payment System** - One-time Stripe checkout
2. **Email Notifications** - Resend integration with templates
3. **Admin Dashboard** - Analytics and revenue charts
4. **Subscription System** - Monthly/yearly recurring billing
5. **Refund Management** - Request and approval workflow
6. **Webhook Integration** - All Stripe events handled

### 📋 Ready for Testing:
- All payment flows (one-time & subscriptions)
- Email confirmations (requires Resend key)
- Admin dashboard access
- Refund request system

### 🚀 Production Deployment:
1. Set all environment variables in Vercel
2. Deploy migrations to production Supabase
3. Configure Stripe webhooks to production domain
4. Enable Resend in production (domain verification)
5. Test end-to-end payment flow

### 🔮 Future Enhancements:
1. Mobile app (iOS/Android)
2. Advanced reporting (CSV exports)
3. Bulk promotion management
4. API for third-party integrations
5. Multi-language support

---

## Support

- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- TanStack Router: https://tanstack.com/router
