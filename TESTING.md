# Testing Guide - Biraj.HR Payment System

Complete guide for testing payment flows locally and in production.

---

## Local Testing Setup

### Prerequisites
1. **Node.js** 18+
2. **Stripe CLI** installed and authenticated
3. **Supabase** local development setup (optional)
4. **Environment variables** configured in `.env.local`

### Step 1: Install Stripe CLI

#### macOS
```bash
brew install stripe/stripe-cli/stripe
```

#### Linux
```bash
curl https://files.stripe.com/stripe-cli/install.sh -O && bash install.sh
```

#### Windows
```bash
choco install stripe
```

### Step 2: Authenticate Stripe CLI

```bash
stripe login
```

This opens browser for authentication. Authenticate with your Stripe test account.

### Step 3: Start Local Dev Server

```bash
npm run dev
```

Server will be at `http://localhost:5173`

### Step 4: Forward Webhooks Locally

In a new terminal:

```bash
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

This will output your webhook signing secret. Add it to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

---

## Testing Payment Flows

### Test Card Numbers

Use these in the Stripe checkout form:

| Card Type | Number | Status |
|-----------|--------|--------|
| Visa | 4242 4242 4242 4242 | ✅ Success |
| Visa (Declined) | 4000 0000 0000 0002 | ❌ Declined |
| Visa (Insufficient Funds) | 4000 0000 0000 9995 | ❌ Declined |
| Visa (Expired) | 4000 0000 0000 0069 | ❌ Expired |
| Visa (Processing Error) | 4000 0000 0000 0119 | ⚠️ Error |
| 3D Secure Required | 4000 0025 0000 3155 | 🔐 3D Secure |

**For all cards:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Postal Code: Any 5 digits (e.g., 12345)

### Flow 1: One-Time Promotion

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

**In Browser:**
1. Go to http://localhost:5173
2. Click listing → "Promiraj oglas"
3. Select tier (Featured)
4. Enter test email: `test@example.com`
5. Click "Nastavi na Stripe"
6. Enter card: 4242 4242 4242 4242
7. Complete payment

**Expected Results:**
- ✅ Redirect to success page with order details
- ✅ Order appears in promotion_orders table
- ✅ Listing updated with promotion_tier
- ✅ Email sent (check Resend dashboard)
- ✅ Webhook log shows checkout.session.completed

### Flow 2: Subscription

Same as Flow 1, but:
1. Go to `/racun/subscription` (if implemented)
2. Click "Subscribe"
3. Select billing interval (Monthly/Yearly)
4. Complete payment with test card

**Expected Results:**
- ✅ Redirect to subscription confirmation
- ✅ subscription_orders table has active record
- ✅ Stripe subscription ID stored
- ✅ Next billing date set correctly

### Flow 3: Failed Payment

**In Browser:**
1. Follow same flow as Flow 1
2. Use card: 4000 0000 0000 0002 (Declined)
3. Submit payment

**Expected Results:**
- ❌ Payment declined error shown
- ❌ Webhook shows charge.failed
- ❌ promotion_orders status = 'failed'
- ❌ Listing NOT updated with promotion

### Flow 4: Refund Request

**In Browser:**
1. Go to /racun/povrat-novca
2. Select completed promotion
3. Click "Zatraži Povrat Novca"
4. Enter reason
5. Submit

**Expected Results:**
- ✅ Status changes to 'refund_requested'
- ✅ refund_requests record created
- ✅ Email sent to user
- ✅ Admin can approve in dashboard

---

## Testing with Stripe CLI

### Trigger Webhook Events

Manually trigger webhook events:

```bash
# Successful payment
stripe trigger checkout.session.completed

# Failed charge
stripe trigger charge.failed

# Refund
stripe trigger charge.refunded

# Subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Invoice events
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### View Webhook Logs

```bash
# Real-time logs
stripe logs tail

# Show recent logs
stripe logs list --limit=10
```

### Testing Specific Metadata

Create charges with specific metadata:

```bash
stripe charges create \
  --amount=1000 \
  --currency=usd \
  --source=tok_visa \
  --metadata='{"listingId":"test-123","tier":"featured"}'
```

---

## Database Testing

### Check Order Creation

```sql
-- View all test orders
SELECT id, user_id, tier, price_eur, payment_status, created_at
FROM promotion_orders
WHERE payment_status = 'completed'
ORDER BY created_at DESC
LIMIT 10;

-- Check specific order
SELECT * FROM promotion_orders
WHERE id = 'xxx-xxx-xxx';

-- View refund requests
SELECT r.*, o.price_eur, o.tier
FROM refund_requests r
JOIN promotion_orders o ON r.order_id = o.id
ORDER BY r.requested_at DESC;
```

### Cleanup Test Data

```sql
-- Delete test orders
DELETE FROM promotion_orders
WHERE user_id IN (
  SELECT id FROM profiles
  WHERE email LIKE 'test%@example.com'
);

-- Reset promotion expires
UPDATE listings
SET promotion_tier = NULL,
    promotion_expires_at = NULL
WHERE id IN (
  SELECT listing_id FROM promotion_orders
  WHERE user_id IN (
    SELECT id FROM profiles
    WHERE email LIKE 'test%@example.com'
  )
);
```

---

## Email Testing

### Resend Dashboard

1. Go to https://resend.com/emails
2. Login with test account
3. See all sent emails with:
   - Recipient
   - Subject
   - Timestamp
   - Open status
   - Click status

### Resend API Test

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

### Email Verification

Check that confirmation emails contain:
- ✓ Order number
- ✓ Tier information
- ✓ Price and expiry date
- ✓ Next steps section
- ✓ Company branding

---

## Testing Utilities

### Import Test Helpers

```typescript
import {
  STRIPE_TEST_CARDS,
  logPaymentStep,
  TEST_DATA_GENERATORS,
  PAYMENT_FLOW_CHECKLIST
} from '@/lib/stripe.test-utils';

// Use test email generator
const testEmail = TEST_DATA_GENERATORS.testEmail();
// → "test-1692345123456@example.com"

// Log payment steps
logPaymentStep('User selected tier', { tier: 'featured' });

// Print all available test data
printTestDataHelpers();
```

### Browser Console Testing

```javascript
// In browser console

// Test email generator
import { TEST_DATA_GENERATORS } from '@/lib/stripe.test-utils';
TEST_DATA_GENERATORS.testEmail();

// Format card number
formatCardNumber('4242424242424242');
// → "4242 4242 4242 4242"

// Check if email is test email
isValidTestEmail('test@example.com');
// → true
```

---

## Performance Testing

### Load Testing

Use Apache Bench or similar:

```bash
# Test checkout endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:5173/checkout/promoted/listing-id
```

### Database Query Performance

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM promotion_orders
WHERE user_id = 'xxx'
ORDER BY created_at DESC;

-- Check index usage
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename = 'promotion_orders';
```

### Webhook Performance

```bash
# Measure webhook response time
curl -w "\n%{time_total}s total time\n" \
  -X POST http://localhost:5173/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed","data":{"object":{}}}'
```

---

## Production Testing

### Pre-Production Checklist

- [ ] All environment variables set correctly
- [ ] STRIPE_WEBHOOK_SECRET matches production webhook
- [ ] RESEND_API_KEY is production key
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Stripe production mode enabled
- [ ] Webhook URL updated in Stripe dashboard
- [ ] Email domain verified in Resend
- [ ] Database backups configured
- [ ] Error logging/monitoring setup

### Production Payment Flow

1. **Use Stripe Live Mode:**
   - Production stripe keys (pk_live_, sk_live_)
   - Real credit cards

2. **Verify Webhook:**
   - Endpoint: https://your-domain.com/api/webhooks/stripe
   - Signature secret verified
   - Events logged

3. **Email Verification:**
   - Test email with production email
   - Verify delivery
   - Check formatting

4. **Order Verification:**
   - Check order in production DB
   - Verify all fields populated
   - Test admin dashboard

---

## Common Issues & Solutions

### Issue: Webhook Not Received

**Solution:**
1. Check Stripe CLI is running
2. Verify webhook secret in `.env.local`
3. Check browser console for errors
4. View Stripe webhook logs: `stripe logs tail`

### Issue: Email Not Sent

**Solution:**
1. Check RESEND_API_KEY is set
2. Verify email address in test (not @example.com for production)
3. Check Resend dashboard for bounces
4. Review server logs for errors

### Issue: Order Not Created

**Solution:**
1. Check webhook was received
2. Verify Supabase connection
3. Check user exists in database
4. Review server logs for DB errors
5. Verify RLS policies

### Issue: Stripe Checkout Not Loading

**Solution:**
1. Check VITE_STRIPE_PUBLISHABLE_KEY is set
2. Verify Stripe account is in test mode (locally)
3. Check browser console for JS errors
4. Verify DOM element #stripe-container exists

---

## Continuous Integration Testing

### GitHub Actions Test Workflow

```yaml
name: Payment Flow Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres

    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run linter
        run: npm run lint
      
      - name: Test payment functions
        run: npm run test:payments
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY_TEST }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY_TEST }}
```

---

## Monitoring & Observability

### Enable Debug Mode

```bash
# In .env.local
DEBUG=stripe:*
LOG_LEVEL=debug
VITE_DEBUG_PAYMENTS=true
```

### Server Logs

```bash
# View server logs
npm run dev 2>&1 | grep -i "payment\|stripe\|webhook"
```

### Stripe Dashboard Monitoring

1. Logs → Events (see webhook deliveries)
2. Webhooks → Endpoint (view attempts)
3. Charges → List (see test charges)
4. Subscriptions → Active (see test subscriptions)

---

## Support & Debugging

### Useful Resources

- **Stripe Docs**: https://stripe.com/docs/testing
- **Stripe API Reference**: https://stripe.com/docs/api
- **Resend Docs**: https://resend.com/docs
- **Supabase Docs**: https://supabase.com/docs

### Debug Commands

```bash
# Test Stripe connectivity
curl -u $STRIPE_SECRET_KEY: https://api.stripe.com/v1/charges?limit=1

# Test Supabase
curl -H "Authorization: Bearer $SUPABASE_KEY" \
  "$VITE_SUPABASE_URL/rest/v1/promotion_orders?limit=1"

# View all test data
npm run test:helpers
```

---

## Troubleshooting Script

Create `scripts/test-payment-flow.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Payment Flow..."

# Check env vars
echo "✓ Checking environment..."
[[ -z "$STRIPE_SECRET_KEY" ]] && echo "❌ Missing STRIPE_SECRET_KEY"
[[ -z "$STRIPE_WEBHOOK_SECRET" ]] && echo "❌ Missing STRIPE_WEBHOOK_SECRET"

# Check Stripe CLI
echo "✓ Checking Stripe CLI..."
stripe --version || echo "❌ Stripe CLI not installed"

# Check connectivity
echo "✓ Checking connectivity..."
curl -s http://localhost:5173 > /dev/null && echo "✓ Dev server running" || echo "❌ Dev server not running"

# List test cards
echo "✓ Available test cards:"
stripe token list --limit=5

echo "✅ Setup complete! Run: npm run dev && stripe listen"
```

Run:
```bash
chmod +x scripts/test-payment-flow.sh
./scripts/test-payment-flow.sh
```

---

## End-to-End Test Checklist

- [ ] Checkout form displays correctly
- [ ] Stripe Elements load
- [ ] Card validation works
- [ ] Test card accepted
- [ ] Success page shows order details
- [ ] Payment email received
- [ ] Order in database
- [ ] Admin dashboard updated
- [ ] Refund request works
- [ ] Refund email sent
- [ ] Subscription recurring charge works
- [ ] Failed card properly rejected
- [ ] Error messages clear and helpful

---

Happy testing! 🚀
