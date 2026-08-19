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
5. Copy `Signing secret` → `STRIPE_WEBHOOK_SECRET`

**For local testing**, use Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:5173/api/webhooks/stripe
stripe trigger checkout.session.completed
```

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
│   ├── checkout.promoted.$listingId.tsx  # Stripe checkout form
│   ├── checkout.success.tsx               # Payment confirmation
│   ├── checkout.cancel.tsx                # Payment failure
│   ├── racun.placanja.tsx                 # Payment history
│   └── index.tsx                          # Homepage (promoted listings)
├── lib/
│   ├── auth.tsx                          # Authentication (demo mode in dev)
│   ├── stripe.functions.ts               # Stripe server functions
│   ├── stripe.webhook.ts                 # Webhook handler
│   └── mock/data.ts                      # Mock data + pricing
└── api/
    └── webhooks/stripe.ts                # Stripe webhook endpoint

supabase/
├── migrations/
│   └── 20260819_promotion_system.sql    # Promotion schema
```

---

## 8. Key Features

### Promotion Tiers:
- **Spotlight**: €10/week
- **Featured**: €15/week
- **Premium**: €20/week
- **VIP**: €35/week

### Database Tables:
- `promotion_orders` — Payment records
- `listings` — Has `promotion_tier`, `promotion_expires_at`

### RLS Policies:
- Users can only view/create their own orders
- Admins can manage all orders

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

## 10. Next Steps

1. ✅ Payment system (done)
2. 📧 Email notifications (Resend)
3. 📊 Admin analytics
4. 💳 Subscription checkout
5. 📱 Mobile app

---

## Support

- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- TanStack Router: https://tanstack.com/router
