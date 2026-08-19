# Biraj.HR Production Setup Guide

Complete guide for setting up production infrastructure, monitoring, and CI/CD.

---

## Part 1: GitHub Actions Setup

### Prerequisites
- GitHub repository connected to Vercel
- Vercel account with project created
- Access to GitHub repository settings

### Step 1: Add Vercel Secrets to GitHub

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

```
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_TOKEN
```

To find these values:
- **VERCEL_TOKEN**: https://vercel.com/account/tokens (Create new token)
- **VERCEL_ORG_ID**: From Vercel Settings → General
- **VERCEL_PROJECT_ID**: From Vercel Project Settings

### Step 2: Verify CI/CD Workflows

The following workflows are now active:

#### CI Workflow (ci.yml)
Runs on every push and pull request:
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Build verification

Status: Runs on `push` and `pull_request` to `main` and feature branches

#### Deploy Workflow (deploy.yml)
Runs on every push to main:
- ✅ Builds on Vercel
- ✅ Deploys to production
- ✅ Posts deployment link to PRs

Status: Automatically deploys when code is merged to `main`

### Step 3: Test CI/CD

```bash
# Make a small change and push
git checkout -b test/ci-verification
echo "# CI Test" >> README.md
git add README.md
git commit -m "Test CI/CD pipeline"
git push -u origin test/ci-verification

# Go to GitHub → Actions to watch workflow run
# Then open a PR and merge to test deploy workflow
```

---

## Part 2: Sentry Error Tracking

### Step 1: Create Sentry Account

1. Go to https://sentry.io
2. Sign up for free account
3. Create a new project:
   - Platform: React
   - Alert Settings: On
4. Copy your DSN (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### Step 2: Configure Sentry in Environment Variables

Add to **Vercel** Environment Variables:

```
Name: VITE_SENTRY_DSN
Value: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
Environments: Production, Preview, Development
```

Also add locally to `.env`:
```
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Step 3: Initialize Sentry in Application

Sentry is already configured in:
- `src/lib/sentry.config.ts` - Configuration
- Ready to use in any component via `captureException()`, `captureMessage()`, `setUserContext()`

### Step 4: Test Sentry Integration

```bash
# In browser console (logged in user):
import { captureException } from '/src/lib/sentry.config.ts'
captureException(new Error('Test error from console'))

# Check Sentry dashboard in 1-2 minutes
```

### Step 5: Configure Alerts

In Sentry Dashboard:

1. Go to Alerts → Create Alert
2. Choose: When: "An event is seen" → Filter by tags
3. Set conditions:
   - Environment: `production`
   - Level: `error`
4. Set notification: Email or Slack
5. Create alert

---

## Part 3: Environment Variables Checklist

### Local Development (`.env`)
```
VITE_SUPABASE_URL=xxxxx
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

### Vercel Production
All environment variables should be set to:
- **Environment**: Production
- **Git Branches**: main

Required variables (same 9 as deployment guide plus):
```
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_APP_VERSION=1.0.0
```

---

## Part 4: Monitoring & Logging

### Error Tracking
- **Tool**: Sentry
- **What it tracks**: JavaScript errors, exceptions, performance issues
- **Dashboard**: https://sentry.io/organizations/[your-org]/issues/

### Application Logs
- **Vercel Logs**: https://vercel.com/[project]/logs/overview
- **View logs**: `vercel logs --tail` in CLI

### Database Monitoring
- **Supabase**: Dashboard → Logs → Database logs
- **Query performance**: Supabase → Settings → Database → Performance

### Stripe Monitoring
- **Webhook logs**: Stripe Dashboard → Developers → Webhooks → Endpoint
- **Failed charges**: Stripe Dashboard → Payments → Failed

### Resend Monitoring
- **Email logs**: Resend Dashboard → Emails
- **Bounce rate**: Monitor for deliverability issues

---

## Part 5: Daily Operations

### Morning Checklist
```bash
# Check for errors
vercel logs --tail

# Verify Stripe webhooks
# Go to Stripe Dashboard → Developers → Webhooks
# Status should be ✅ green with recent events
```

### Weekly Tasks
1. Review Sentry dashboard for new issues
2. Check Stripe balance for any failed charges
3. Monitor Supabase query performance
4. Review email delivery metrics in Resend

### Monthly Tasks
1. Review analytics in admin dashboard
2. Check refund queue
3. Audit payment data in Supabase
4. Review cost breakdown (Vercel, Stripe, Supabase, Resend)

---

## Part 6: Automated Backups

### Supabase Automated Backups

Supabase automatically backs up your database:
- Free plan: Daily backups (7 days retention)
- Pro plan: Hourly backups (30 days retention)

To restore from backup:
1. Go to Supabase → Project → Backups
2. Click restore on the backup you want
3. Select when to restore

### Manual Backup

```bash
# Backup database using Supabase CLI
supabase db pull

# This creates migration file with current schema
```

---

## Part 7: Scaling Considerations

### For Increased Traffic

1. **Database**: Enable read replicas in Supabase
2. **Caching**: Implement Redis caching (Upstash)
3. **Images**: Use Vercel Image Optimization
4. **Assets**: Configure Vercel Edge Cache

### Performance Optimization

- Monitor Core Web Vitals in Sentry
- Use React.lazy() for code splitting
- Optimize database queries with indexes
- Cache Stripe objects in memory

---

## Part 8: Security Hardening

### Before Going Live

- [ ] Remove all test data from production Supabase
- [ ] Enable all Stripe security settings
- [ ] Review RLS policies in Supabase
- [ ] Enable 2FA on all service accounts
- [ ] Review environment variables (no hardcoded secrets)
- [ ] Set up security headers in Vercel

### Ongoing Security

- Update dependencies monthly: `npm update`
- Review GitHub Security tab for alerts
- Monitor Sentry for security-related errors
- Audit Stripe API activity monthly

---

## Troubleshooting

### CI/CD Issues

**Workflow not running?**
```bash
# Check GitHub Actions status
git push origin test-branch
# Go to GitHub → Actions → see logs
```

**Build fails in CI but works locally?**
1. Check environment variables in Vercel
2. Verify `npm install` works: `rm node_modules && npm install`
3. Check Node version: `node --version` (should be v20+)

### Sentry Not Capturing Errors

1. Verify DSN is correct in `.env`
2. Check that app is in production mode
3. Verify error happens in browser (not server)
4. Check Sentry project settings → filters

### GitHub Actions Secrets Not Working

1. Go to Settings → Secrets and variables → Actions
2. Verify secret names match exactly
3. Try re-creating the secret (delete and recreate)
4. Verify no extra spaces in secret value

---

## Success Criteria

✅ GitHub Actions CI passes on every push
✅ Automatic deployment to Vercel on merge to main
✅ Sentry dashboard shows production environment
✅ Error logging working (test error appears in Sentry)
✅ All environment variables configured
✅ Vercel logs accessible via CLI
✅ Stripe webhooks showing ✅ status
✅ Backup strategy verified

---

## Next Steps

1. Set up Vercel secrets (VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN)
2. Create Sentry account and add DSN
3. Configure environment variables in Vercel
4. Test CI/CD pipeline with a test push
5. Verify Sentry error tracking with test error
6. Set up Sentry alerts for production errors

---

**Last Updated**: August 19, 2026
**Version**: 1.0.0
