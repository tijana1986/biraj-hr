# Biraj.HR API Documentation

## Server Functions (RPC Endpoints)

### Stripe Payment Functions

#### createCheckoutSession
One-time payment checkout for promotions.

**URL**: POST `/api/stripe/checkout`
**Method**: Server Function

**Input**:
```typescript
{
  listingType: "standard" | "premium"  // Maps to tier
  categorySlug: string                  // Listing category
  userEmail: string                     // Customer email
  listingTitle: string                  // Display name
}
```

**Output**:
```typescript
{
  sessionId: string    // Stripe session ID
  url: string          // Checkout URL (redirect here)
}
```

**Example**:
```javascript
const result = await createCheckoutSession({
  listingType: "premium",
  categorySlug: "elektronika",
  userEmail: "user@example.com",
  listingTitle: "iPhone 14 Pro Max"
});

// Redirect to Stripe
window.location.href = result.url;
```

**Errors**:
- Invalid email format
- Stripe API unavailable
- Invalid listing type

---

#### createSubscriptionCheckout
Recurring subscription checkout.

**Input**:
```typescript
{
  listingType: "standard" | "premium"
  categorySlug: string
  userEmail: string
  listingTitle: string
  billingInterval: "month" | "year"  // New field
}
```

**Output**:
```typescript
{
  sessionId: string
  url: string
}
```

**Example**:
```javascript
const result = await createSubscriptionCheckout({
  listingType: "premium",
  categorySlug: "elektronika",
  userEmail: "user@example.com",
  listingTitle: "iPhone 14 Pro Max",
  billingInterval: "month"
});

window.location.href = result.url;
```

**Pricing**:
- Standard (Monthly): €29.99
- Standard (Yearly): €359.88
- Premium (Monthly): €79.99
- Premium (Yearly): €959.88

---

#### confirmPayment
Check payment intent status.

**Input**:
```typescript
{
  paymentIntentId: string  // Stripe payment intent ID
}
```

**Output**:
```typescript
{
  status: "succeeded" | "processing" | "requires_payment_method"
  id: string
  amount: number  // In EUR
  succeeded: boolean
}
```

---

### Email Functions

#### sendPaymentConfirmation
Send payment confirmation email.

**Input**:
```typescript
{
  email: string              // Recipient
  orderNumber: string        // Order ID
  tier: string               // Promotion tier
  price: number              // Amount in EUR
  listingTitle: string       // Listing name
  expiresAt: string         // ISO date string
}
```

**Output**:
```typescript
{
  success: boolean
  messageId?: string         // Resend message ID
  error?: string
}
```

**Template**: Custom HTML with company branding, order details, next steps

---

#### sendRefundConfirmation
Send refund notification email.

**Input**:
```typescript
{
  email: string
  orderNumber: string
  refundAmount: number
  reason: string             // Refund reason
}
```

**Output**:
```typescript
{
  success: boolean
  messageId?: string
  error?: string
}
```

**Timeline**: 3-5 working days for bank processing

---

## Database Queries (Supabase)

### promotion_orders Table

#### Get User's Payment History
```sql
SELECT * FROM promotion_orders
WHERE user_id = $1
ORDER BY created_at DESC;
```

**Response**:
```typescript
{
  id: string
  user_id: string
  listing_id: string
  tier: "spotlight" | "featured" | "premium" | "vip"
  price_eur: number
  payment_status: "completed" | "pending" | "failed" | "refunded" | "refund_requested"
  stripe_session_id: string
  created_at: string
  expires_at: string
}[]
```

#### Check Active Promotions
```sql
SELECT * FROM listings
WHERE promotion_tier IS NOT NULL
  AND promotion_expires_at > NOW()
ORDER BY promotion_activated_at DESC
LIMIT 10;
```

---

### subscription_orders Table

#### Get User's Subscriptions
```sql
SELECT * FROM subscription_orders
WHERE user_id = $1
  AND status IN ('active', 'paused')
ORDER BY created_at DESC;
```

**Response**:
```typescript
{
  id: string
  user_id: string
  listing_id: string
  tier: string
  price_eur: number
  billing_interval: "month" | "year"
  stripe_subscription_id: string
  status: "active" | "paused" | "cancelled" | "past_due"
  current_period_start: string
  current_period_end: string
  next_billing_date: string
  created_at: string
}[]
```

#### Cancel Subscription
```sql
UPDATE subscription_orders
SET status = 'cancelled', cancelled_at = NOW()
WHERE id = $1 AND user_id = $2;
```

---

### refund_requests Table

#### Request Refund
```sql
INSERT INTO refund_requests (order_id, user_id, reason)
VALUES ($1, $2, $3)
RETURNING *;
```

#### Admin: View Pending Refunds
```sql
SELECT 
  r.*,
  o.price_eur,
  o.tier,
  p.email
FROM refund_requests r
JOIN promotion_orders o ON r.order_id = o.id
JOIN profiles p ON r.user_id = p.id
WHERE r.status = 'pending'
ORDER BY r.requested_at ASC;
```

#### Admin: Approve Refund
```sql
UPDATE refund_requests
SET status = 'approved', processed_at = NOW()
WHERE id = $1;

-- Then trigger Stripe refund
UPDATE promotion_orders
SET payment_status = 'refunded'
WHERE id = (SELECT order_id FROM refund_requests WHERE id = $1);
```

---

## Webhook Events

### Stripe Webhooks

All webhooks go to `POST /api/webhooks/stripe`

**Authentication**: Verified with `STRIPE_WEBHOOK_SECRET`

#### checkout.session.completed
- **Triggered**: Successful payment
- **Action**: Create promotion_orders record, update listing, send email
- **Data**: Session includes metadata (listingType, categorySlug)

#### customer.subscription.created
- **Triggered**: New subscription started
- **Action**: Create subscription_orders record
- **Data**: Stripe subscription ID, period start/end dates

#### customer.subscription.updated
- **Triggered**: Subscription changes (pause, resume, metadata change)
- **Action**: Update subscription_orders status and dates

#### customer.subscription.deleted
- **Triggered**: Subscription cancelled
- **Action**: Set status to 'cancelled', record cancelled_at

#### invoice.payment_succeeded
- **Triggered**: Automatic recurring payment succeeded
- **Action**: Set subscription status to 'active', update next billing date

#### invoice.payment_failed
- **Triggered**: Automatic payment failed (expired card, etc.)
- **Action**: Set subscription status to 'past_due'

#### charge.failed
- **Triggered**: One-time payment failed
- **Action**: Update promotion_orders status to 'failed'

#### charge.refunded
- **Triggered**: Refund processed
- **Action**: Update promotion_orders status to 'refunded', send email

---

## Admin API Endpoints

### Dashboard Analytics

#### Get Revenue Stats
```javascript
// Fetch from admin.dashboard component
const { data: orders } = await supabase
  .from('promotion_orders')
  .select('*');

// Calculate metrics
const totalRevenue = orders
  .filter(o => o.payment_status === 'completed')
  .reduce((sum, o) => sum + o.price_eur, 0);

const totalOrders = orders
  .filter(o => o.payment_status === 'completed').length;

const failedOrders = orders
  .filter(o => o.payment_status === 'failed').length;
```

#### Get Payment Breakdown by Status
```javascript
const statusCount = {
  completed: orders.filter(o => o.payment_status === 'completed').length,
  failed: orders.filter(o => o.payment_status === 'failed').length,
  refunded: orders.filter(o => o.payment_status === 'refunded').length,
  pending: orders.filter(o => o.payment_status === 'pending').length
};
```

#### Get Revenue by Tier
```javascript
const tierRevenue = orders
  .filter(o => o.payment_status === 'completed')
  .reduce((acc, o) => {
    acc[o.tier] = (acc[o.tier] || 0) + o.price_eur;
    return acc;
  }, {});
```

---

## Error Handling

### Common Errors

#### Invalid Email
```
Error: "Unesite ispravnu e-poštu"
Status: 400
```

#### Missing Listing
```
Error: "Oglas nije pronađen"
Status: 404
```

#### Stripe Error
```
Error: "Nije moguće otvoriti Stripe checkout"
Status: 500
```

#### Webhook Signature Invalid
```
Error: "Missing signature"
Status: 400
```

### Retry Strategy
- **Client**: Automatic retry on network errors
- **Webhook**: Stripe retries for 3 days if we return non-2xx
- **Email**: Failed emails logged, manual retry available

---

## Rate Limiting

- **Checkout**: 10 requests per user per minute
- **Webhook**: No limit (Stripe handles throttling)
- **API Queries**: Standard Supabase limits apply

---

## Data Retention

- **Successful Orders**: Kept indefinitely
- **Failed Orders**: Kept 90 days then archived
- **Refund Requests**: Kept 1 year
- **Email Logs**: Kept 30 days (Resend)

---

## Security

### Secrets (Server-Only)
- `STRIPE_SECRET_KEY` - Used to create charges
- `STRIPE_WEBHOOK_SECRET` - Used to verify webhooks
- `RESEND_API_KEY` - Used to send emails
- `SUPABASE_PUBLISHABLE_KEY` - Used server-side auth

### Public Keys (Browser-Safe)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Client-side Stripe
- `VITE_SUPABASE_URL` - Database connection
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Client auth

### RLS Policies
- Users see only their own orders
- Admins see all orders
- Refund requests are auto-created on status change

---

## Integration Examples

### Manual Payment Processing
```javascript
// Server function
export const processManualPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    orderId: z.string(),
    amount: z.number()
  }).parse(input))
  .handler(async ({ data }) => {
    const stripe = await getStripe();
    
    // Create charge
    const charge = await stripe.charges.create({
      amount: Math.round(data.amount * 100),
      currency: 'eur',
      source: 'tok_visa'  // Pre-authorized token
    });
    
    // Record in database
    await supabase.from('promotion_orders').update({
      payment_status: 'completed',
      stripe_session_id: charge.id
    }).eq('id', data.orderId);
    
    return { success: true };
  });
```

### Custom Email Template
```javascript
// In email.functions.ts
const customTemplate = `
  <div style="background: #f0f0f0; padding: 20px;">
    <h1>${listingTitle}</h1>
    <p>Thank you for your purchase</p>
    <!-- Custom HTML -->
  </div>
`;

await resend.emails.send({
  from: "noreply@biraj.hr",
  to: email,
  subject: "Custom Subject",
  html: customTemplate
});
```

---

## Monitoring & Logging

### Available Logs
- Supabase: All database queries and RLS enforcement
- Stripe: Dashboard shows all events and charges
- Resend: Email delivery status and open rates
- Application: Browser console for client errors

### Health Checks
```bash
# Check Stripe connectivity
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/charges?limit=1

# Check Supabase connectivity  
curl -H "Authorization: Bearer $SUPABASE_PUBLISHABLE_KEY" \
  "$VITE_SUPABASE_URL/rest/v1/promotion_orders?limit=1"

# Check Resend API
curl -H "Authorization: Bearer $RESEND_API_KEY" \
  https://api.resend.com/emails
```

---

## Support

For issues or questions:
1. Check documentation: https://stripe.com/docs, https://supabase.com/docs
2. Review error logs in Stripe/Supabase dashboards
3. Test with: `stripe trigger` CLI commands
4. Contact: support@biraj.hr
