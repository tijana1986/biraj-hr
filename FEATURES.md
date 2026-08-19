# Biraj.HR - Complete Feature Documentation

## Payment System

### 1. One-Time Promotions (src/routes/checkout.promoted.$listingId.tsx)
**Purpose**: Sell time-limited promotion boosts for listings

**Tiers**:
- Spotlight: €10/week - Highlighted listing
- Featured: €15/week - Featured placement
- Premium: €20/week - Premium badge + featured
- VIP: €35/week - VIP placement + email feature

**Flow**:
1. User clicks "Promiraj oglas" on listing
2. Selects tier and enters email
3. Redirected to Stripe Checkout
4. Payment processed via Stripe
5. Webhook creates promotion_orders record
6. Email confirmation sent
7. Listing gets promotion_tier, promotion_expires_at

**Files**:
- checkout.promoted.$listingId.tsx - UI form
- stripe.functions.ts - createCheckoutSession()
- webhook handler - checkout.session.completed event

---

## 2. Recurring Subscriptions (src/routes/racun.subscription.tsx)
**Purpose**: Recurring monthly/yearly promotion subscriptions

**Pricing**:
- Standard: €29.99/month
- Premium: €79.99/month
- Yearly billing also available

**Features**:
- Automatic monthly billing on signup
- Cancel anytime (cancels on next billing date)
- Manage all active subscriptions
- View next billing date
- Handle failed payments (past_due status)

**Database**:
```sql
subscription_orders:
- id, user_id, listing_id
- tier, price_eur, billing_interval
- stripe_subscription_id, status
- current_period_start/end, next_billing_date
- created_at, cancelled_at
```

**Files**:
- racun.subscription.tsx - Manage subscriptions UI
- racun.subscription-potvrda.tsx - Confirmation page
- stripe.functions.ts - createSubscriptionCheckout()
- webhook handler - customer.subscription.* events

---

## 3. Email Notifications (src/lib/email.functions.ts)

### Email Types:

#### Payment Confirmation
Triggered: When checkout.session.completed webhook received
Content:
- Order number and tier
- Price and expiry date
- Next steps (promotion activation timeline)
- Refund policy

#### Refund Confirmation
Triggered: When refund is approved
Content:
- Order number and refund amount
- Timeline (3-5 working days)
- Contact support option

#### Subscription Confirmation
Triggered: When subscription_orders created
Content:
- Subscription tier and price
- Billing interval
- Next billing date
- Cancellation info

**Implementation**:
- Resend SDK for sending
- Custom HTML templates
- Error handling and logging
- Sent from noreply@biraj.hr

**Files**:
- email.functions.ts - sendPaymentConfirmation(), sendRefundConfirmation()
- stripe.ts webhook - Calls Resend after payment processing

---

## 4. Refund System (src/routes/racun.povrat-novca.tsx)

### Request Refund Flow:
1. User goes to /racun/povrat-novca
2. Sees list of completed promotions
3. Clicks "Zatraži Povrat Novca"
4. Enters reason in dialog
5. Status changes to 'refund_requested'
6. Automatic refund_requests record created
7. Admin notified for approval

### Admin Approval:
- Admin dashboard sees pending refunds
- Approves/rejects with notes
- Automatic Stripe refund initiated
- Email confirmation sent to user

### Database:
```sql
refund_requests:
- id, order_id, user_id
- reason, status (pending/approved/rejected/processed)
- requested_at, processed_at

promotion_orders adds:
- refund_reason, refund_requested_at, refund_processed_at
- stripe_refund_id
```

**Files**:
- racun.povrat-novca.tsx - Request UI
- email.functions.ts - sendRefundConfirmation()
- Trigger function: handle_refund_request() creates refund_requests

---

## 5. Admin Dashboard (src/routes/admin.dashboard.tsx)

### Metrics:
- Total Revenue (€)
- Total Completed Orders (count)
- Failed Orders (count)
- Total Refunded (€)

### Analytics Charts:
1. **Daily Revenue Line Chart**
   - X-axis: Date
   - Y-axis: Revenue in €
   - Shows 30-day trend

2. **Revenue by Tier Pie Chart**
   - Distribution of revenue across Spotlight/Featured/Premium/VIP
   - Percentages and €

3. **Payment Status Bar Chart**
   - Completed (green), Failed (red), Refunded (blue), Pending (orange)
   - Count per status

### Recent Transactions Table:
- Last 10 payments
- Date, Tier, Amount, Status
- Color-coded status badges

**Access**: `/admin/dashboard` (restricted to admin role)

**Files**:
- admin.dashboard.tsx
- Uses recharts for visualizations
- Queries promotion_orders from Supabase

---

## 6. Database Schema

### New Tables:

#### promotion_orders
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK auth.users)
- listing_id UUID (FK listings)
- tier VARCHAR (spotlight/featured/premium/vip)
- price_eur DECIMAL
- payment_status (completed/pending/failed/refunded/refund_requested)
- stripe_session_id, stripe_payment_intent_id
- created_at, completed_at, expires_at
- refund_reason, refund_requested_at, refund_processed_at
```

#### subscription_orders
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK auth.users)
- listing_id UUID (FK listings)
- tier VARCHAR
- price_eur DECIMAL
- billing_interval (month/year)
- stripe_subscription_id UNIQUE
- status (active/paused/cancelled/past_due)
- current_period_start, current_period_end
- next_billing_date
- created_at, cancelled_at
```

#### refund_requests
```sql
- id UUID PRIMARY KEY
- order_id UUID (FK promotion_orders)
- user_id UUID (FK auth.users)
- reason TEXT
- status (pending/approved/rejected/processed)
- requested_at, processed_at
```

### Modified Tables:

#### listings
Added:
- promotion_tier VARCHAR
- promotion_expires_at TIMESTAMP
- promotion_activated_at TIMESTAMP
- subscription_tier VARCHAR
- subscription_active BOOLEAN
- subscription_expires_at TIMESTAMP

---

## 7. Webhook Events Handled

### Stripe Webhooks:

1. **checkout.session.completed**
   - Creates promotion_orders record
   - Updates listing with promotion_tier
   - Sends payment confirmation email
   - Triggers auto-expiry function

2. **charge.failed**
   - Updates order status to 'failed'
   - Logs failure reason

3. **charge.refunded**
   - Updates order status to 'refunded'
   - Records refund_processed_at

4. **customer.subscription.created**
   - Creates subscription_orders record
   - Sets status to active
   - Stores Stripe subscription ID

5. **customer.subscription.updated**
   - Updates subscription status and dates
   - Updates next_billing_date

6. **customer.subscription.deleted**
   - Sets status to 'cancelled'
   - Records cancelled_at

7. **invoice.payment_succeeded**
   - Sets status to 'active'
   - Updates next billing date

8. **invoice.payment_failed**
   - Sets status to 'past_due'
   - Flags for manual intervention

---

## 8. Security Considerations

### Authentication:
- RLS enabled on all tables
- Users can only see own orders
- Admins see all orders (checked via profiles.role)

### Payment:
- Stripe keys never exposed to client
- Secret key only used on server
- Webhook signature verification required
- Session IDs used for order matching

### Email:
- Resend API key server-only
- No sensitive data in email templates
- From: noreply@biraj.hr (verified domain)

### Admin:
- Role-based access control
- Refund approvals logged
- Audit trail via created_at timestamps

---

## 9. Testing Checklist

### Local Testing:
```bash
# Start dev server
npm run dev

# In another terminal, forward Stripe webhooks
stripe listen --forward-to localhost:5173/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

### Test Payment Flow:
1. Go to listing
2. Click "Promiraj oglas"
3. Select tier
4. Enter test email
5. Use test card: 4242 4242 4242 4242
6. Submit
7. Check:
   - Redirect to success page
   - Email received (Resend sandbox)
   - Order in Supabase promotion_orders table
   - Listing shows promotion_tier

### Admin Dashboard:
1. Go to /admin/dashboard
2. Check stats cards display correctly
3. Charts render with sample data
4. Recent transactions table populates

### Refund Flow:
1. Create test promotion (card: 4242 4242 4242 4242)
2. Go to /racun/povrat-novca
3. Click "Zatraži Povrat Novca"
4. Enter reason and submit
5. Check:
   - Status changes in table
   - Email sent (Resend)
   - refund_requests table has record

---

## 10. Environment Variables Required

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_PROJECT_ID=xxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend
RESEND_API_KEY=re_xxx

# App
VITE_APP_URL=http://localhost:5173
```

---

## 11. File Structure

```
src/
├── routes/
│   ├── checkout.promoted.$listingId.tsx    # One-time checkout
│   ├── checkout.success.tsx                # Confirmation page
│   ├── checkout.cancel.tsx                 # Failed payment page
│   ├── racun.placanja.tsx                  # Payment history
│   ├── racun.subscription.tsx              # Manage subscriptions
│   ├── racun.subscription-potvrda.tsx      # Subscription confirmation
│   ├── racun.povrat-novca.tsx              # Request refunds
│   ├── admin.dashboard.tsx                 # Admin analytics
│   └── api/webhooks/stripe.ts              # Webhook endpoint
├── lib/
│   ├── stripe.functions.ts                 # Checkout functions
│   ├── email.functions.ts                  # Email sending
│   └── auth.tsx                            # Auth (demo mode)
└── components/
    └── ui/                                 # Shadcn components

supabase/
├── migrations/
│   ├── 20260819_promotion_system.sql       # Initial schema
│   ├── 20260819_subscription_system.sql    # Subscriptions
│   └── 20260819_refund_system.sql          # Refunds
```

---

## 12. Next Steps

1. ✅ Core payment system
2. ✅ Email notifications  
3. ✅ Subscription system
4. ✅ Admin dashboard
5. ✅ Refund system
6. 🚀 Production deployment
7. 📱 Mobile app (future)
8. 📊 Advanced analytics (future)

---

## Support & Documentation

- Stripe Docs: https://stripe.com/docs/payments
- Supabase Docs: https://supabase.com/docs
- Resend Docs: https://resend.com/docs
- TanStack Router: https://tanstack.com/router/latest
