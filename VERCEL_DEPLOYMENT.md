# Biraj.HR Vercel Deployment Guide

Complete guide to deploy Biraj.HR payment system on Vercel.

---

## Prerequisites

1. **Vercel Account** - https://vercel.com
2. **GitHub Repository** - Connected to Vercel
3. **Stripe Account** (Live Mode)
4. **Supabase Project** (Production)
5. **Resend Account** (with domain verified)
6. **Domain** - biraj.hr (or your domain)

---

## Step 1: Create Vercel Project

### Option A: Auto-Import from GitHub
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Search for `biraj-hr`
4. Click "Import"
5. Vercel creates project automatically

### Option B: Manual Connection
```bash
npm i -g vercel
vercel --prod
```

---

## Step 2: Add Environment Variables to Vercel

### Access Environment Variables
1. Go to Vercel Dashboard
2. Select "biraj-hr" project
3. Settings → Environment Variables
4. Add each variable below

### Required Environment Variables

#### Supabase Variables
```
Name: VITE_SUPABASE_URL
Value: https://[your-project].supabase.co
Environments: Production, Preview, Development
```

```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGc... (your publishable key)
Environments: Production, Preview, Development
```

```
Name: SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGc... (same as above)
Environments: Production, Preview, Development
```

```
Name: SUPABASE_PROJECT_ID
Value: [your-project-id]
Environments: Production, Preview, Development
```

#### Stripe Variables (LIVE MODE)
```
Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_live_xxxxxxxxxxxxx (production key!)
Environments: Production
```

```
Name: STRIPE_SECRET_KEY
Value: sk_live_xxxxxxxxxxxxx (production key!)
Environments: Production
```

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_xxxxxxxxxxxxx (production webhook secret)
Environments: Production
```

#### Resend Email Variable
```
Name: RESEND_API_KEY
Value: re_xxxxxxxxxxxxx
Environments: Production, Preview, Development
```

#### App URL Variable
```
Name: VITE_APP_URL
Value: https://biraj.hr (your domain)
Environments: Production
```

---

## Step 3: Configure Domain on Vercel

1. Go to Vercel Project Settings
2. Domains → Add Domain
3. Enter: `biraj.hr`
4. Vercel shows DNS records to add

### Add DNS Records
Update your domain registrar with:
- **Type:** CNAME
- **Name:** www (or @)
- **Value:** cname.vercel.com

Wait 5-10 minutes for DNS propagation.

---

## Step 4: Configure Stripe Webhook

### Update Stripe Webhook Endpoint
1. Go to Stripe Dashboard
2. Developers → Webhooks
3. Find endpoint → Click to edit
4. Update URL to: `https://biraj.hr/api/webhooks/stripe`
5. Save changes

### Verify Webhook Events
Ensure these events are enabled:
- ✅ checkout.session.completed
- ✅ charge.failed
- ✅ charge.refunded
- ✅ customer.subscription.created
- ✅ customer.subscription.updated
- ✅ customer.subscription.deleted
- ✅ invoice.payment_succeeded
- ✅ invoice.payment_failed

---

## Step 5: Apply Database Migrations

### Connect to Supabase
1. Go to Supabase Dashboard
2. Select your project
3. Go to SQL Editor

### Apply Migrations
Run each migration file in order:

```sql
-- 1. Promotion System
-- Copy from: supabase/migrations/20260819_promotion_system.sql
-- Paste and execute

-- 2. Subscription System
-- Copy from: supabase/migrations/20260819_subscription_system.sql
-- Paste and execute

-- 3. Refund System
-- Copy from: supabase/migrations/20260819_refund_system.sql
-- Paste and execute

-- 4. Payment Methods
-- Copy from: supabase/migrations/20260819_payment_methods.sql
-- Paste and execute
```

### Verify Migrations
Check that tables exist:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Should show:
- promotion_orders
- subscription_orders
- refund_requests
- payment_methods
- invoices

---

## Step 6: Verify Resend Setup

### Domain Verification
1. Go to Resend Dashboard
2. Domains → Add Domain
3. Enter: `biraj.hr`
4. Add DNS records shown

### Test Email Delivery
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -d '{
    "from": "noreply@biraj.hr",
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

---

## Step 7: Deploy to Vercel

### Automatic Deployment
```bash
git push origin main
# Vercel auto-deploys
```

### Manual Deployment
1. Vercel Dashboard → biraj-hr project
2. Click "Redeploy" on latest commit

### Monitor Deployment
1. Go to Deployments tab
2. Wait for "Ready" status (usually 2-3 minutes)
3. Check build logs for errors

---

## Step 8: Post-Deployment Testing

### Test Payment Flow
1. Go to https://biraj.hr
2. Click on listing → "Promiraj oglas"
3. Select tier → Enter email
4. Click "Nastavi na Stripe"
5. Use test card: 4242 4242 4242 4242
6. Complete payment

### Expected Results
- ✅ Redirect to success page
- ✅ Order visible in /racun/placanja
- ✅ Email received
- ✅ Listing shows promotion_tier
- ✅ Admin dashboard updated

### Verify Webhook
1. Go to Stripe Dashboard
2. Developers → Webhooks
3. Select endpoint → View events
4. Should show: "checkout.session.completed"
5. Status should be: ✅ Success

### Check Email
1. Go to Resend Dashboard
2. Emails section
3. Should see payment confirmation email
4. Status: Delivered

---

## Troubleshooting

### Issue: Build Fails
**Solution:**
1. Check build logs in Vercel
2. Verify all environment variables set
3. Check package.json dependencies
4. Try: `npm install && npm run build` locally

### Issue: 404 on Checkout
**Solution:**
1. Verify routes are deployed
2. Check if build succeeded
3. Try: `vercel env pull` to sync env vars
4. Redeploy

### Issue: Webhook Not Received
**Solution:**
1. Verify STRIPE_WEBHOOK_SECRET is correct
2. Check webhook URL in Stripe dashboard
3. View webhook events in Stripe logs
4. Stripe CLI: `stripe logs tail`

### Issue: Email Not Sent
**Solution:**
1. Verify RESEND_API_KEY
2. Check Resend dashboard for bounces
3. Verify domain is verified
4. Check sender is `noreply@biraj.hr`

### Issue: Database Connection Error
**Solution:**
1. Verify SUPABASE_PROJECT_ID
2. Check VITE_SUPABASE_URL is correct
3. Verify database is accessible
4. Check RLS policies

---

## Production Checklist

- [ ] Vercel project created and connected
- [ ] All 9 environment variables added
- [ ] Domain configured (biraj.hr)
- [ ] DNS records propagated
- [ ] Stripe webhook updated to production URL
- [ ] Stripe live mode enabled
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Resend domain verified
- [ ] Payment flow tested end-to-end
- [ ] Webhook delivery verified
- [ ] Email delivery verified
- [ ] Admin dashboard accessible
- [ ] Order history shows records
- [ ] Refund system works
- [ ] Subscription auto-renewal verified

---

## Monitoring & Maintenance

### Daily Checks
```bash
# Check Stripe webhook logs
stripe logs tail

# Check Vercel deployment logs
vercel logs [--tail]

# Check Resend email delivery
# Go to Resend Dashboard → Emails
```

### Weekly Checks
1. Vercel → Deployments → Check for failed builds
2. Stripe → Balance → Check for failed charges
3. Supabase → Database → Check query performance
4. Monitor error rates

### Monthly Tasks
1. Review analytics in admin dashboard
2. Check refund queue
3. Verify all migrations applied
4. Update environment variables if needed

---

## Scaling Considerations

### For High Traffic
1. Enable Supabase read replicas
2. Configure Stripe webhook retries
3. Add caching with Vercel Edge Cache
4. Monitor database query performance

### Database Optimization
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Add indexes if needed
CREATE INDEX idx_orders_user_created 
ON promotion_orders(user_id, created_at DESC);
```

---

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or redeploy previous version in Vercel
# Vercel Dashboard → Deployments → Click prev version → Redeploy
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Status Pages**:
  - Vercel: https://status.vercel.com
  - Stripe: https://status.stripe.com
  - Supabase: https://status.supabase.com

---

## Environment Variables Summary

| Variable | Value | Environment |
|----------|-------|-------------|
| VITE_SUPABASE_URL | supabase.co URL | All |
| VITE_SUPABASE_PUBLISHABLE_KEY | Public key | All |
| SUPABASE_PUBLISHABLE_KEY | Public key | All |
| SUPABASE_PROJECT_ID | Project ID | All |
| VITE_STRIPE_PUBLISHABLE_KEY | pk_live_... | Production |
| STRIPE_SECRET_KEY | sk_live_... | Production |
| STRIPE_WEBHOOK_SECRET | whsec_... | Production |
| RESEND_API_KEY | re_... | All |
| VITE_APP_URL | https://biraj.hr | Production |

---

## Quick Deployment Commands

```bash
# Push to deploy
git push origin main

# Check deployment status
vercel status

# View build logs
vercel logs

# Pull latest env vars
vercel env pull

# Redeploy
vercel redeploy

# View domains
vercel domains ls
```

---

## Testing Production

### Smoke Tests
```bash
# Check homepage
curl https://biraj.hr

# Check admin dashboard
curl https://biraj.hr/admin/dashboard

# Check payment endpoint
curl https://biraj.hr/api/webhooks/stripe -X POST
# Should return 400 (no body)
```

### Full Test Cycle
1. Create test user
2. Make test payment (€0.50 with test card)
3. Verify order created
4. Check email delivery
5. Verify listing updated
6. Check admin dashboard
7. Request refund
8. Verify refund processed

---

## Success Criteria

✅ Homepage loads
✅ Checkout page accessible
✅ Stripe Checkout loads
✅ Payment successful with test card
✅ Order created in database
✅ Confirmation email received
✅ Listing shows promotion
✅ Admin dashboard shows stats
✅ Refund request works
✅ Webhook logs show events

---

**Status**: Ready for Deployment ✅
**Last Updated**: August 19, 2026
**Version**: 1.0.0
