# Biraj.HR Go-Live Checklist

Complete checklist before going live to production. Follow in order.

---

## Phase 1: Infrastructure Setup (Days 1-2)

### Domain & DNS
- [ ] Purchase domain `biraj.hr`
- [ ] Add Vercel DNS records (CNAME)
- [ ] Verify DNS propagation (5-10 min wait)
- [ ] Test domain loads in browser

### Vercel Deployment
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Add 9 environment variables (see VERCEL_DEPLOYMENT.md)
- [ ] Configure domain in Vercel
- [ ] Verify deployment preview works
- [ ] Test production URL: https://biraj.hr

### Stripe Configuration
- [ ] Create Stripe account (Live Mode)
- [ ] Add live publishable key (pk_live_...)
- [ ] Add live secret key (sk_live_...)
- [ ] Configure webhook to `https://biraj.hr/api/webhooks/stripe`
- [ ] Enable webhook events: checkout.session.completed, charge.failed, customer.subscription.*
- [ ] Test webhook delivery

### Supabase Production
- [ ] Create production Supabase project
- [ ] Apply all 4 database migrations
- [ ] Verify tables created:
  - [ ] promotion_orders
  - [ ] subscription_orders
  - [ ] refund_requests
  - [ ] payment_methods
  - [ ] invoices
- [ ] Verify RLS policies enabled
- [ ] Test database access

### Resend Email
- [ ] Create Resend account
- [ ] Add domain `biraj.hr`
- [ ] Verify DNS records for email
- [ ] Test email sending
- [ ] Verify confirmation emails working

### GitHub Actions
- [ ] Create GitHub action secrets:
  - [ ] VERCEL_ORG_ID
  - [ ] VERCEL_PROJECT_ID
  - [ ] VERCEL_TOKEN
- [ ] Verify CI workflow passes
- [ ] Verify deploy workflow auto-deploys
- [ ] Test with dummy commit

### Error Tracking
- [ ] Create Sentry account
- [ ] Add Sentry DSN to environment
- [ ] Configure production alerts
- [ ] Set up Slack/email notifications
- [ ] Test error capture

---

## Phase 2: Payment System Testing (Day 3)

### One-Time Payments
- [ ] Create test listing in admin
- [ ] Start checkout flow
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] Verify order created in database
- [ ] Verify listing shows promotion
- [ ] Verify confirmation email sent
- [ ] Verify Stripe webhook logged

### Subscription Payments
- [ ] Start subscription checkout
- [ ] Select monthly tier
- [ ] Complete payment with test card
- [ ] Verify subscription_orders created
- [ ] Verify auto-renewal logic working
- [ ] Check next billing date is correct

### Failed Payments
- [ ] Use declined card: 4000 0000 0000 0002
- [ ] Attempt payment
- [ ] Verify order marked as failed
- [ ] Verify error message shown to user
- [ ] Verify failure webhook logged

### Refund Flow
- [ ] Make a successful payment
- [ ] Go to /racun/povrat-novca
- [ ] Request refund with reason
- [ ] Verify refund_request created in database
- [ ] Manually process refund in Stripe
- [ ] Verify order marked as refunded
- [ ] Verify refund confirmation email sent

### Admin Dashboard
- [ ] Go to /admin/dashboard
- [ ] Verify stats showing correct data:
  - [ ] Total Revenue
  - [ ] Completed Orders
  - [ ] Failed Orders
  - [ ] Refunded Amount
- [ ] Verify charts rendering
- [ ] Verify recent transactions showing

### Payment History
- [ ] Go to /racun/placanja
- [ ] Verify all orders showing
- [ ] Verify correct tiers, prices, dates
- [ ] Test download invoice PDF
- [ ] Verify invoice number format

### Invoices
- [ ] Go to /racun/racuni
- [ ] Verify invoices auto-generated
- [ ] Verify invoice numbers (INV-YYYYMM-ID)
- [ ] Download and verify PDF format
- [ ] Check all payment details accurate

### Payment Methods
- [ ] Go to /racun/payment-methods
- [ ] Add test credit card
- [ ] Verify card stored securely
- [ ] Verify last 4 digits showing
- [ ] Test delete card
- [ ] Verify can set as default

---

## Phase 3: Security Audit (Day 4)

### Data Protection
- [ ] Verify RLS policies blocking unauthorized access
- [ ] Test user can only see own orders
- [ ] Test admin can see all orders
- [ ] Verify no test cards in production database
- [ ] Verify no personal data in logs

### API Security
- [ ] Verify webhook signature validation working
- [ ] Test with invalid signature (should reject)
- [ ] Verify Stripe keys not in frontend code
- [ ] Verify Supabase key is publishable only
- [ ] Check for hardcoded secrets in git history: `git log -p | grep -i "password\|key\|secret"`

### Frontend Security
- [ ] Verify no console errors in production
- [ ] Verify sensitive operations require login
- [ ] Test CSRF protection on forms
- [ ] Verify XSS protection (render HTML-escaped)
- [ ] Check Content Security Policy headers

### Monitoring
- [ ] Verify Sentry capturing errors
- [ ] Verify no PII in error logs
- [ ] Verify error rate tracking
- [ ] Verify performance metrics tracking

---

## Phase 4: Performance Testing (Day 5)

### Page Load Speed
- [ ] Test homepage load time (target: <3s)
- [ ] Test checkout page load (target: <2s)
- [ ] Test admin dashboard load (target: <3s)
- [ ] Use Google PageSpeed Insights

### Database Performance
- [ ] Verify query indexes created:
  - [ ] promotion_orders(user_id)
  - [ ] subscription_orders(stripe_subscription_id)
  - [ ] refund_requests(status)
- [ ] Test with 100+ orders in database
- [ ] Verify admin dashboard queries complete <1s
- [ ] Monitor database connection pooling

### Payment Processing
- [ ] Verify Stripe API calls <500ms
- [ ] Test webhook handling under 5s response time
- [ ] Verify email sending doesn't block payment
- [ ] Monitor API rate limits (Stripe, Resend)

### Caching
- [ ] Verify browser caching enabled (images, CSS, JS)
- [ ] Test asset cache expiry headers
- [ ] Verify API response caching where appropriate

---

## Phase 5: Documentation & Training (Day 6)

### Documentation
- [ ] Review VERCEL_DEPLOYMENT.md is complete
- [ ] Review PRODUCTION_SETUP.md is complete
- [ ] Create team runbook for common tasks
- [ ] Document admin procedures
- [ ] Create user FAQ for payment issues

### Admin Training
- [ ] Train team to use admin dashboard
- [ ] Show how to view orders and payments
- [ ] Show how to process refunds
- [ ] Show how to manage promotions
- [ ] Document support escalation process

### Monitoring Setup
- [ ] Configure Sentry alerts for team
- [ ] Set up Slack notifications
- [ ] Create Sentry project access for team
- [ ] Document error response procedures

### Backup Verification
- [ ] Test Supabase backup restore process
- [ ] Document backup schedule
- [ ] Document disaster recovery plan

---

## Phase 6: Final Verification (Day 7)

### End-to-End Testing
- [ ] New user registration
- [ ] Create listing
- [ ] Promote listing (complete payment)
- [ ] Verify promotion active on listing
- [ ] Check payment history
- [ ] Download invoice
- [ ] Request refund
- [ ] Check admin sees payment
- [ ] Admin processes refund

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

### Network Conditions
- [ ] Test on slow 3G (Chrome DevTools)
- [ ] Test on offline then reconnect
- [ ] Verify graceful error handling
- [ ] Verify retry logic working

### Email Testing
- [ ] Verify confirmation email format
- [ ] Verify refund email format
- [ ] Check email arrives in <5 minutes
- [ ] Test spam filters (check promotions folder)

### Monitoring Dashboard
- [ ] Verify Sentry shows production environment
- [ ] Verify Vercel deployment logs accessible
- [ ] Verify Stripe webhook logs clean
- [ ] Verify Resend email logs clean

---

## Phase 7: Go Live (Day 8)

### Pre-Launch
- [ ] All above checklist items ✅
- [ ] Team trained and ready
- [ ] Support team briefed
- [ ] Emergency contact list created
- [ ] Rollback plan documented

### Launch Steps
- [ ] Announce go-live (internal team)
- [ ] Monitor Sentry for errors (first 2 hours)
- [ ] Monitor Vercel logs for issues
- [ ] Monitor Stripe webhooks
- [ ] Monitor email delivery
- [ ] Check admin dashboard data

### Post-Launch (First 24 Hours)
- [ ] Verify first real payment processed successfully
- [ ] Verify confirmation email delivered
- [ ] Check admin analytics updating correctly
- [ ] Monitor error rate in Sentry
- [ ] Respond to any support issues
- [ ] Verify scheduled backups running

### Post-Launch (First Week)
- [ ] Monitor daily for errors
- [ ] Check all payment flows working
- [ ] Verify webhook delivery stable
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Address any bugs found

---

## Rollback Plan

If critical issues found before/during launch:

1. **Immediate**: Disable payment checkout in Stripe dashboard
2. **Revert**: `git revert HEAD && git push origin main`
3. **Verify**: Vercel auto-redeploys
4. **Communicate**: Notify users of temporary maintenance
5. **Fix**: Identify and fix issue locally
6. **Redeploy**: Push fix and monitor

---

## Success Criteria

✅ All infrastructure deployed and verified
✅ All payments processed and tracked
✅ All emails delivered
✅ All dashboards working
✅ All security checks passed
✅ Performance meets targets
✅ Monitoring and alerts working
✅ Team trained and ready
✅ First 10 real payments processed successfully
✅ Zero critical errors in first week

---

## Emergency Contacts

Set up before launch:
- Stripe Support: support@stripe.com
- Supabase Support: support@supabase.com
- Vercel Support: support@vercel.com
- Sentry Support: support@sentry.io
- Resend Support: support@resend.com
- Team Lead: [phone/email]
- On-Call: [rotation schedule]

---

**Last Updated**: August 19, 2026
**Estimated Duration**: 8 days
**Status**: Ready to Start
